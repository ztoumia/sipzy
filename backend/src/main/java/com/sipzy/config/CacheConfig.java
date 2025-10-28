package com.sipzy.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Cache Configuration
 * Enables caching for frequently accessed data to improve performance
 * Uses Spring's default simple cache implementation (ConcurrentHashMap)
 *
 * For production, consider using Redis or Caffeine for distributed caching
 */
@Configuration
@EnableCaching
public class CacheConfig {
    // Spring Boot will auto-configure a simple ConcurrentMapCacheManager
    // when @EnableCaching is present and no explicit CacheManager is defined
}
