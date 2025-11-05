package com.sipzy.admin.dto;

import com.sipzy.admin.domain.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for admin activity management
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminActivityDto {
    private Long id;
    private ActivityType type;
    private String message;
    private Long userId;
    private String username;
    private Long coffeeId;
    private String coffeeName;
    private Instant createdAt;
}
