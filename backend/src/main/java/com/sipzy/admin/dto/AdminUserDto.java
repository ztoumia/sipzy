package com.sipzy.admin.dto;

import com.sipzy.user.domain.User.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for admin user management
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDto {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private String avatarUrl;
    private String bio;
    private String location;
    private Boolean isVerified;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
