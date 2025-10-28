package com.sipzy.review.dto.response;

import com.sipzy.user.dto.response.UserResponse;

import java.time.Instant;

public record ReviewResponse(
    Long id,
    Long coffeeId,
    CoffeeSummary coffee,
    Long userId,
    UserResponse user,
    Integer rating,
    String comment,
    String imageUrl,
    Integer helpfulCount,
    Integer notHelpfulCount,
    Boolean isFlagged,
    Instant createdAt,
    Instant updatedAt
) {}
