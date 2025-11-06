package com.sipzy.security.metrics;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Metrics for rate limiting monitoring (2025 best practices)
 *
 * Tracks:
 * - Total requests
 * - Rejected requests (429 responses)
 * - Rejection rate by endpoint
 * - Rejection rate by user type (anonymous/authenticated/admin)
 */
@Slf4j
@Component
public class RateLimitMetrics {

    @Getter
    private final AtomicLong totalRequests = new AtomicLong(0);

    @Getter
    private final AtomicLong rejectedRequests = new AtomicLong(0);

    private final Map<String, AtomicLong> rejectionsByEndpoint = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> rejectionsByUserType = new ConcurrentHashMap<>();

    /**
     * Record a request
     */
    public void recordRequest() {
        totalRequests.incrementAndGet();
    }

    /**
     * Record a rejected request
     */
    public void recordRejection(String endpoint, String userType) {
        rejectedRequests.incrementAndGet();

        // Track by endpoint
        rejectionsByEndpoint
                .computeIfAbsent(endpoint, k -> new AtomicLong(0))
                .incrementAndGet();

        // Track by user type
        rejectionsByUserType
                .computeIfAbsent(userType, k -> new AtomicLong(0))
                .incrementAndGet();

        // Log for monitoring systems
        log.warn("Rate limit exceeded - endpoint: {}, userType: {}, total rejections: {}",
                endpoint, userType, rejectedRequests.get());
    }

    /**
     * Get rejection count for a specific endpoint
     */
    public long getRejectionsByEndpoint(String endpoint) {
        AtomicLong count = rejectionsByEndpoint.get(endpoint);
        return count != null ? count.get() : 0;
    }

    /**
     * Get rejection count for a specific user type
     */
    public long getRejectionsByUserType(String userType) {
        AtomicLong count = rejectionsByUserType.get(userType);
        return count != null ? count.get() : 0;
    }

    /**
     * Get all endpoint rejection stats
     */
    public Map<String, Long> getAllEndpointRejections() {
        Map<String, Long> result = new ConcurrentHashMap<>();
        rejectionsByEndpoint.forEach((key, value) -> result.put(key, value.get()));
        return result;
    }

    /**
     * Get all user type rejection stats
     */
    public Map<String, Long> getAllUserTypeRejections() {
        Map<String, Long> result = new ConcurrentHashMap<>();
        rejectionsByUserType.forEach((key, value) -> result.put(key, value.get()));
        return result;
    }

    /**
     * Get rejection rate (0.0 to 1.0)
     */
    public double getRejectionRate() {
        long total = totalRequests.get();
        if (total == 0) {
            return 0.0;
        }
        return (double) rejectedRequests.get() / total;
    }

    /**
     * Reset all metrics (useful for testing or periodic reset)
     */
    public void reset() {
        totalRequests.set(0);
        rejectedRequests.set(0);
        rejectionsByEndpoint.clear();
        rejectionsByUserType.clear();
        log.info("Rate limit metrics reset");
    }
}
