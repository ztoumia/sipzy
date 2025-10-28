package com.sipzy.coffee.domain;

/**
 * Coffee status enum for moderation workflow
 */
public enum CoffeeStatus {
    PENDING,    // Awaiting admin approval
    APPROVED,   // Approved and visible to users
    REJECTED    // Rejected by admin
}
