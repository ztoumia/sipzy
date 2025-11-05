package com.sipzy.admin.dto;

import com.sipzy.admin.domain.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for admin report management
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportDto {
    private Long id;
    private Long reporterId;
    private String reporterUsername;
    private String entityType;
    private Long entityId;
    private String reason;
    private String description;
    private ReportStatus status;
    private Long resolvedById;
    private String resolvedByUsername;
    private String adminNotes;
    private Instant resolvedAt;
    private Instant createdAt;
}
