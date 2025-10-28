package com.sipzy.review.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Command DTO pour voter sur un avis
 * Record: simple, une seule propriété avec validation
 */
public record VoteReviewRequest(
        @NotNull(message = "isHelpful is required")
        Boolean isHelpful
) {
}
