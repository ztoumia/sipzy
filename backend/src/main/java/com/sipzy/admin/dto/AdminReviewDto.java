package com.sipzy.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for admin review management
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewDto {
    private Long id;
    private Long coffeeId;
    private String coffeeName;
    private Long userId;
    private String username;
    private Short rating;
    private String comment;
    private String brewMethod;
    private Integer helpfulCount;
    private Integer notHelpfulCount;
    private Instant createdAt;
    private Instant updatedAt;
}
