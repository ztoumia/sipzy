package com.sipzy.coffee.dto.response;

import java.time.Instant;

/**
 * DTO for Note responses
 */
public record NoteResponse(
        Long id,
        String name,
        String category,
        Instant createdAt
) {
}
