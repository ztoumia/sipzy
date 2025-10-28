package com.sipzy.review.dto.response;

public record ReviewVoteResponse(
    Long reviewId,
    Boolean isHelpful,
    Integer helpfulCount,
    Integer notHelpfulCount
) {}
