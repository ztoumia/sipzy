package com.sipzy.user.dto.response;

import java.time.Instant;

public record UserResponse(
    Long id,
    String username,
    String email,
    String role,
    String avatarUrl,
    String bio,
    Boolean isActive,
    Boolean emailVerified,
    Instant createdAt,
    Instant updatedAt
) {}
