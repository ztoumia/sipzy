package com.sipzy.security;

import com.sipzy.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
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
import java.util.Map;

/**
 * Rate Limiting Filter using Bucket4j
 *
 * Limits requests based on user authentication status:
 * - Anonymous users: 20 requests per minute (IP-based)
 * - Authenticated users: 100 requests per minute (user-based)
 * - Admin users: 1000 requests per minute (effectively unlimited)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitConfig rateLimitConfig;
    private final Map<String, Bucket> rateLimitBuckets;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip rate limiting for admin endpoints
        String requestPath = request.getRequestURI();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (requestPath.startsWith("/api/admin/") && isAdmin(authentication)) {
            // Admin users are exempt from rate limiting on admin endpoints
            filterChain.doFilter(request, response);
            return;
        }

        // Get rate limit key (IP for anonymous, userId for authenticated)
        String rateLimitKey = getRateLimitKey(request);

        // Get or create bucket for this key
        Bucket bucket = rateLimitBuckets.computeIfAbsent(rateLimitKey, key -> createBucket());

        // Try to consume 1 token
        if (bucket.tryConsume(1)) {
            // Request allowed
            filterChain.doFilter(request, response);
        } else {
            // Rate limit exceeded
            log.warn("Rate limit exceeded for key: {}", rateLimitKey);
            response.setStatus(429); // HTTP 429 Too Many Requests
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":429,\"error\":\"Too Many Requests\"," +
                    "\"message\":\"Rate limit exceeded. Please try again later.\",\"path\":\"" +
                    request.getRequestURI() + "\"}"
            );
        }
    }

    /**
     * Check if the current authentication is an admin
     */
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }

    /**
     * Get rate limit key based on authentication status
     */
    private String getRateLimitKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

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
     * Create appropriate bucket based on authentication status
     */
    private Bucket createBucket() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {

            // Check if user is admin
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (isAdmin) {
                log.debug("Creating admin bucket");
                return rateLimitConfig.createAdminBucket();
            } else {
                log.debug("Creating authenticated user bucket");
                return rateLimitConfig.createAuthenticatedBucket();
            }
        } else {
            log.debug("Creating anonymous bucket");
            return rateLimitConfig.createAnonymousBucket();
        }
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
            ip = request.getRemoteAddr();
        }
        // If multiple IPs, take the first one
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
