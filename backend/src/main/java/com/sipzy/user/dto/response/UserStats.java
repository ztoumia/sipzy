package com.sipzy.user.dto.response;

public record UserStats(
    Integer totalReviews,
    Integer totalCoffeesSubmitted,
    Double averageRating,
    Integer helpfulVotes
) {}
