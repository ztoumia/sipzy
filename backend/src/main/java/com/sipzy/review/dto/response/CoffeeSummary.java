package com.sipzy.review.dto.response;

public record CoffeeSummary(
    Long id,
    String name,
    String imageUrl,
    RoasterSummary roaster
) {
    public record RoasterSummary(
        Long id,
        String name
    ) {}
}
