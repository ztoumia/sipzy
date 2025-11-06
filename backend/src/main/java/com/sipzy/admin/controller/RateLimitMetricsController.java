package com.sipzy.admin.controller;

import com.sipzy.common.dto.ApiResponse;
import com.sipzy.security.metrics.RateLimitMetrics;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Admin endpoint for monitoring rate limiting metrics
 *
 * Provides insights into:
 * - Total requests processed
 * - Rejected requests (429 responses)
 * - Rejection rate by endpoint
 * - Rejection rate by user type
 * - Overall rejection rate
 */
@RestController
@RequestMapping("/api/admin/rate-limit")
@RequiredArgsConstructor
@Tag(name = "Admin - Rate Limit Metrics", description = "Monitor rate limiting behavior")
@SecurityRequirement(name = "Bearer Authentication")
public class RateLimitMetricsController {

    private final RateLimitMetrics metrics;

    /**
     * Get comprehensive rate limit metrics
     */
    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get rate limit metrics", description = "Get detailed metrics about rate limiting")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMetrics() {
        Map<String, Object> metricsData = new HashMap<>();

        metricsData.put("totalRequests", metrics.getTotalRequests().get());
        metricsData.put("rejectedRequests", metrics.getRejectedRequests().get());
        metricsData.put("rejectionRate", String.format("%.2f%%", metrics.getRejectionRate() * 100));
        metricsData.put("rejectionsByEndpoint", metrics.getAllEndpointRejections());
        metricsData.put("rejectionsByUserType", metrics.getAllUserTypeRejections());

        return ResponseEntity.ok(ApiResponse.success(metricsData, "Rate limit metrics retrieved successfully"));
    }

    /**
     * Get rejections by endpoint
     */
    @GetMapping("/rejections/endpoints")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get rejections by endpoint", description = "Get rate limit rejections grouped by endpoint")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getRejectionsByEndpoint() {
        Map<String, Long> rejections = metrics.getAllEndpointRejections();
        return ResponseEntity.ok(ApiResponse.success(rejections, "Rejections by endpoint retrieved successfully"));
    }

    /**
     * Get rejections by user type
     */
    @GetMapping("/rejections/user-types")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get rejections by user type", description = "Get rate limit rejections grouped by user type")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getRejectionsByUserType() {
        Map<String, Long> rejections = metrics.getAllUserTypeRejections();
        return ResponseEntity.ok(ApiResponse.success(rejections, "Rejections by user type retrieved successfully"));
    }

    /**
     * Get overall statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get rate limit statistics", description = "Get overall rate limit statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        long total = metrics.getTotalRequests().get();
        long rejected = metrics.getRejectedRequests().get();
        long allowed = total - rejected;

        stats.put("totalRequests", total);
        stats.put("allowedRequests", allowed);
        stats.put("rejectedRequests", rejected);
        stats.put("rejectionRate", metrics.getRejectionRate());
        stats.put("allowanceRate", 1.0 - metrics.getRejectionRate());

        return ResponseEntity.ok(ApiResponse.success(stats, "Rate limit statistics retrieved successfully"));
    }

    /**
     * Reset all metrics (useful for testing or periodic cleanup)
     */
    @PostMapping("/reset")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reset rate limit metrics", description = "Reset all rate limiting metrics to zero")
    public ResponseEntity<ApiResponse<String>> resetMetrics() {
        metrics.reset();
        return ResponseEntity.ok(ApiResponse.success("OK", "Rate limit metrics reset successfully"));
    }
}
