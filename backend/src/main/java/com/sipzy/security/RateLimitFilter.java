package com.sipzy.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sipzy.config.RateLimitConfig;
import com.sipzy.security.metrics.RateLimitMetrics;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Modern Rate Limiting Filter (2025 Best Practices)
 *
 * Features:
 * - Token bucket algorithm with burst support
 * - Standard HTTP headers (X-RateLimit-*, Retry-After)
 * - Differentiated limits by user role and endpoint type
 * - Sensitive endpoints protection (login, register, password reset)
 * - Health check endpoints excluded
 * - Comprehensive metrics and monitoring
 * - Configurable via application.properties
 * - Clear JSON error responses
 *
 * Limits based on user authentication:
 * - Anonymous users: 60 requests per minute (IP-based)
 * - Authenticated users: 600 requests per minute (user-based)
 * - Admin users: 3000 requests per minute
 * - Sensitive endpoints: 5 requests per minute (all users)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitConfig rateLimitConfig;
    private final RateLimitConfig.RateLimitProperties rateLimitProperties;
    private final Map<String, Bucket> rateLimitBuckets;
    private final Map<String, Bucket> sensitiveBuckets;
    private final RateLimitMetrics metrics;
    private final ObjectMapper objectMapper;

    // Endpoints excluded from rate limiting
    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
            "/actuator/health",
            "/actuator/info",
            "/api-docs",
            "/swagger-ui",
            "/v3/api-docs"
    );

    // Sensitive endpoints with stricter limits
    private static final List<String> SENSITIVE_ENDPOINTS = Arrays.asList(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/reset-password",
            "/api/auth/forgot-password"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Skip rate limiting for excluded endpoints (health checks, docs)
        if (isExcludedPath(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Record request for metrics
        metrics.recordRequest();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Check if this is a sensitive endpoint (stricter limits)
        boolean isSensitiveEndpoint = isSensitiveEndpoint(requestPath);

        // Get appropriate bucket
        Bucket bucket;
        String rateLimitKey;
        String userType;

        if (isSensitiveEndpoint) {
            // Sensitive endpoints: use separate bucket with stricter limits
            rateLimitKey = getSensitiveEndpointKey(request, authentication);
            bucket = sensitiveBuckets.computeIfAbsent(rateLimitKey,
                key -> rateLimitConfig.createSensitiveBucket(rateLimitProperties));
            userType = "sensitive";
        } else {
            // Regular endpoints: use role-based buckets
            rateLimitKey = getRateLimitKey(request, authentication);
            bucket = rateLimitBuckets.get(rateLimitKey);

            if (bucket == null) {
                bucket = createBucketForUser(authentication);
                rateLimitBuckets.put(rateLimitKey, bucket);
            }

            userType = getUserType(authentication);
        }

        // Try to consume 1 token
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Request allowed - add rate limit headers
            addRateLimitHeaders(response, probe, bucket, isSensitiveEndpoint);
            filterChain.doFilter(request, response);
        } else {
            // Rate limit exceeded
            handleRateLimitExceeded(response, probe, request, userType, requestPath);
        }
    }

    /**
     * Check if the path is excluded from rate limiting
     */
    private boolean isExcludedPath(String path) {
        return EXCLUDED_PATHS.stream()
                .anyMatch(path::startsWith);
    }

    /**
     * Check if the endpoint is sensitive (login, register, password reset)
     */
    private boolean isSensitiveEndpoint(String path) {
        return SENSITIVE_ENDPOINTS.stream()
                .anyMatch(path::equals);
    }

    /**
     * Get rate limit key for regular endpoints
     */
    private String getRateLimitKey(HttpServletRequest request, Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            // Use username/userId for authenticated users
            return "user:" + authentication.getName();
        } else {
            // Use IP address for anonymous users
            String ip = getClientIp(request);
            return "ip:" + ip;
        }
    }

    /**
     * Get rate limit key for sensitive endpoints (always IP-based for security)
     */
    private String getSensitiveEndpointKey(HttpServletRequest request, Authentication authentication) {
        String ip = getClientIp(request);
        String path = request.getRequestURI();

        // Combine IP and path for sensitive endpoints
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            return "sensitive:" + authentication.getName() + ":" + path;
        } else {
            return "sensitive:ip:" + ip + ":" + path;
        }
    }

    /**
     * Create bucket based on user role
     */
    private Bucket createBucketForUser(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {

            // Check if user is admin
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (isAdmin) {
                log.debug("Creating admin bucket for {}", authentication.getName());
                return rateLimitConfig.createAdminBucket(rateLimitProperties);
            } else {
                log.debug("Creating authenticated user bucket for {}", authentication.getName());
                return rateLimitConfig.createAuthenticatedBucket(rateLimitProperties);
            }
        } else {
            log.debug("Creating anonymous bucket");
            return rateLimitConfig.createAnonymousBucket(rateLimitProperties);
        }
    }

    /**
     * Get user type for metrics
     */
    private String getUserType(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {

            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            return isAdmin ? "admin" : "authenticated";
        } else {
            return "anonymous";
        }
    }

    /**
     * Add standard rate limit headers (2025 best practices)
     */
    private void addRateLimitHeaders(HttpServletResponse response, ConsumptionProbe probe,
                                     Bucket bucket, boolean isSensitive) {
        long capacity = isSensitive ?
                rateLimitProperties.getSensitiveCapacity() :
                getCapacityForCurrentBucket(bucket);

        // X-RateLimit-Limit: maximum requests allowed in the window
        response.setHeader("X-RateLimit-Limit", String.valueOf(capacity));

        // X-RateLimit-Remaining: requests remaining in current window
        response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));

        // X-RateLimit-Reset: epoch seconds when the limit resets
        long resetTime = Instant.now().plusSeconds(60).getEpochSecond();
        response.setHeader("X-RateLimit-Reset", String.valueOf(resetTime));
    }

    /**
     * Handle rate limit exceeded (HTTP 429)
     */
    private void handleRateLimitExceeded(HttpServletResponse response, ConsumptionProbe probe,
                                         HttpServletRequest request, String userType, String endpoint)
            throws IOException {

        // Calculate retry after seconds
        long retryAfterSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;

        // Record rejection in metrics
        metrics.recordRejection(endpoint, userType);

        // Log warning
        log.warn("Rate limit exceeded - endpoint: {}, userType: {}, retryAfter: {}s",
                endpoint, userType, retryAfterSeconds);

        // Set response status and headers
        response.setStatus(429); // HTTP 429 Too Many Requests
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Standard rate limit headers
        response.setHeader("X-RateLimit-Limit", "0");
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setHeader("X-RateLimit-Reset", String.valueOf(Instant.now().plusSeconds(retryAfterSeconds).getEpochSecond()));
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));

        // Clear JSON error response
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", 429);
        errorResponse.put("error", "Too Many Requests");
        errorResponse.put("message", "Rate limit exceeded. Please try again later.");
        errorResponse.put("path", request.getRequestURI());
        errorResponse.put("retryAfter", retryAfterSeconds + " seconds");
        errorResponse.put("timestamp", Instant.now().toString());

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    /**
     * Get capacity for current bucket
     */
    private long getCapacityForCurrentBucket(Bucket bucket) {
        // Default capacity based on most common case
        return rateLimitProperties.getAuthenticatedCapacity();
    }

    /**
     * Get client IP address, considering proxy headers
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // If multiple IPs (proxy chain), take the first one
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        return ip != null ? ip : "unknown";
    }
}
