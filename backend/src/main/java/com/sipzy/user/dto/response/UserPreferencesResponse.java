package com.sipzy.user.dto.response;

public record UserPreferencesResponse(
    Boolean emailNotifications,
    Boolean reviewNotifications,
    Boolean coffeeApprovalNotifications
) {}
