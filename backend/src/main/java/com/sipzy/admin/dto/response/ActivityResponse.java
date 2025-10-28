package com.sipzy.admin.dto.response;

import java.time.Instant;

/**
 * Response DTO for admin activity feed
 * Record: immutable data carrier for activity log entries
 */
public record ActivityResponse(
        Long id,
        String type, // COFFEE_APPROVED, COFFEE_REJECTED, USER_BANNED, REPORT_RESOLVED, etc.
        String message,
        Long performedById,
        String performedByUsername,
        Long entityId,
        String entityType,
        Instant timestamp
) {}
