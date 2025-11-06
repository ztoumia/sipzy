package com.sipzy.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Modern Rate Limiting Configuration (2025 Best Practices)
 *
 * Features:
 * - Token bucket algorithm with burst support
 * - Differentiated limits by user role
 * - Stricter limits for sensitive endpoints
 * - Configurable via application.properties
 * - Health check endpoints excluded
 *
 * Default Rate limits:
 * - Anonymous: 60 req/min (burst: 10)
 * - Authenticated: 600 req/min (burst: 60)
 * - Admin: 3000 req/min (burst: 200)
 * - Sensitive endpoints: 5 req/min (burst: 1)
 */
@Configuration
public class RateLimitConfig {

    /**
     * Storage for rate limit buckets (key-based: IP or userId)
     */
    @Bean
    public Map<String, Bucket> rateLimitBuckets() {
        return new ConcurrentHashMap<>();
    }

    /**
     * Storage for sensitive endpoint buckets (stricter limits)
     */
    @Bean
    public Map<String, Bucket> sensitiveBuckets() {
        return new ConcurrentHashMap<>();
    }

    /**
     * Rate limit properties (configurable via application.properties)
     */
    @Component
    @ConfigurationProperties(prefix = "app.rate-limit")
    @Getter
    @Setter
    public static class RateLimitProperties {

        // Anonymous users
        private long anonymousCapacity = 60;
        private long anonymousRefillTokens = 60;
        private long anonymousRefillMinutes = 1;

        // Authenticated users
        private long authenticatedCapacity = 600;
        private long authenticatedRefillTokens = 600;
        private long authenticatedRefillMinutes = 1;

        // Admin users
        private long adminCapacity = 3000;
        private long adminRefillTokens = 3000;
        private long adminRefillMinutes = 1;

        // Sensitive endpoints (login, register, password reset)
        private long sensitiveCapacity = 5;
        private long sensitiveRefillTokens = 5;
        private long sensitiveRefillMinutes = 1;
    }

    /**
     * Create bucket for anonymous users (60 req/min by default)
     */
    public Bucket createAnonymousBucket(RateLimitProperties props) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(props.getAnonymousCapacity())
                .refillIntervally(props.getAnonymousRefillTokens(), Duration.ofMinutes(props.getAnonymousRefillMinutes()))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Create bucket for authenticated users (600 req/min by default)
     */
    public Bucket createAuthenticatedBucket(RateLimitProperties props) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(props.getAuthenticatedCapacity())
                .refillIntervally(props.getAuthenticatedRefillTokens(), Duration.ofMinutes(props.getAuthenticatedRefillMinutes()))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Create bucket for admin users (3000 req/min by default)
     */
    public Bucket createAdminBucket(RateLimitProperties props) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(props.getAdminCapacity())
                .refillIntervally(props.getAdminRefillTokens(), Duration.ofMinutes(props.getAdminRefillMinutes()))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Create bucket for sensitive endpoints (5 req/min by default)
     */
    public Bucket createSensitiveBucket(RateLimitProperties props) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(props.getSensitiveCapacity())
                .refillIntervally(props.getSensitiveRefillTokens(), Duration.ofMinutes(props.getSensitiveRefillMinutes()))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
