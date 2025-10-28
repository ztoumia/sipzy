package com.sipzy.coffee.dto.response;

public record RoasterSummary(
    Long id,
    String name,
    String country,
    String website,
    String logoUrl,
    Boolean isVerified
) {}
