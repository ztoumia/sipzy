package com.sipzy.admin.dto.response;

import java.time.Instant;

/**
 * Response DTO for report moderation
 * Record: immutable data carrier for report information
 */
public record ReportResponse(
        Long id,
        String entityType, // COFFEE, REVIEW, USER
        Long entityId,
        String reason,
        String status, // PENDING, RESOLVED, DISMISSED
        Long reportedById,
        String reportedByUsername,
        Long reviewedById,
        String reviewedByUsername,
        String adminNotes,
        Instant createdAt,
        Instant reviewedAt
) {}
