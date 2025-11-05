package com.sipzy.coffee.dto.response;

import java.time.Instant;

/**
 * Full representation of a Roaster for detailed responses
 */
public record RoasterResponse(
        Long id,
        String name,
        String description,
        String location,
        String website,
        String logoUrl,
        Boolean isVerified,
        Instant createdAt,
        Instant updatedAt
) {
}
