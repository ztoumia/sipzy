package com.sipzy.coffee.dto.response;

/**
 * Summary representation of a Roaster for nested responses
 */
public record RoasterSummary(
    Long id,
    String name,
    String location,
    String website,
    String logoUrl,
    Boolean isVerified
) {}
