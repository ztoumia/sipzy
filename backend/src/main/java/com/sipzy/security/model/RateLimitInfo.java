package com.sipzy.security.model;

import lombok.Builder;
import lombok.Data;

/**
 * Rate limit information for HTTP headers
 */
@Data
@Builder
public class RateLimitInfo {
    private long limit;           // X-RateLimit-Limit
    private long remaining;       // X-RateLimit-Remaining
    private long reset;           // X-RateLimit-Reset (epoch seconds)
    private long retryAfter;      // Retry-After (seconds)
}
