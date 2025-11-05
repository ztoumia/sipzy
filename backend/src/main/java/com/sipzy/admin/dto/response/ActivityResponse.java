package com.sipzy.admin.dto.response;

import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.user.dto.response.UserResponse;

import java.time.Instant;

/**
 * Response DTO for admin activity feed
 * Record: immutable data carrier for activity log entries
 */
public record ActivityResponse(
        Long id,
        String type,
        String message,
        Instant timestamp,
        UserResponse user,
        CoffeeResponse coffee
) {}
