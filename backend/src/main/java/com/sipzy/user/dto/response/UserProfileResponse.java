package com.sipzy.user.dto.response;

import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.review.dto.response.ReviewResponse;

import java.util.List;

public record UserProfileResponse(
    UserResponse user,
    UserStats stats,
    List<ReviewResponse> recentReviews,
    List<CoffeeResponse> approvedCoffees
) {}
