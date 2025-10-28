package com.sipzy.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate Limiting Configuration using Bucket4j
 *
 * Rate limits:
 * - Anonymous users: 20 requests per minute
 * - Authenticated users: 100 requests per minute
 * - Admin users: Unlimited
 */
@Configuration
public class RateLimitConfig {

    /**
     * Storage for user buckets (IP-based for anonymous, userId-based for authenticated)
     */
    @Bean
    public Map<String, Bucket> rateLimitBuckets() {
        return new ConcurrentHashMap<>();
    }

    /**
     * Create a bucket for anonymous users (20 requests per minute)
     */
    public Bucket createAnonymousBucket() {
        Bandwidth limit = Bandwidth.classic(20, Refill.intervally(20, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Create a bucket for authenticated users (100 requests per minute)
     */
    public Bucket createAuthenticatedBucket() {
        Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Create a bucket for admin users (1000 requests per minute - effectively unlimited)
     */
    public Bucket createAdminBucket() {
        Bandwidth limit = Bandwidth.classic(1000, Refill.intervally(1000, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
