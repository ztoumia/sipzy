package com.sipzy.coffee.dto.response;

import java.util.List;

/**
 * DTO for Notes grouped by category
 */
public record NoteByCategoryResponse(
        String category,
        List<NoteResponse> notes
) {
}
