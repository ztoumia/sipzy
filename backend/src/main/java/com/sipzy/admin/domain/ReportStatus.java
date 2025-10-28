package com.sipzy.admin.domain;

/**
 * Report status enum for moderation workflow
 */
public enum ReportStatus {
    PENDING,    // New report awaiting review
    RESOLVED,   // Report reviewed and action taken
    DISMISSED   // Report reviewed but no action needed
}
