package com.sipzy.coffee.dto.response;

import com.sipzy.user.dto.response.UserResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CoffeeResponse(
    Long id,
    String name,
    Long roasterId,
    RoasterSummary roaster,
    String origin,
    String process,
    String variety,
    Integer altitudeMin,
    Integer altitudeMax,
    Integer harvestYear,
    String priceRange,
    String description,
    String imageUrl,
    BigDecimal avgRating,
    Integer reviewCount,
    String status,
    Long submittedBy,
    UserResponse submittedByUser,
    Long approvedBy,
    UserResponse approvedByUser,
    Instant approvedAt,
    Instant createdAt,
    Instant updatedAt,
    List<NoteSummary> notes
) {}
