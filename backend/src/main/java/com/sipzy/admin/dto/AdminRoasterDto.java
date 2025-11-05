package com.sipzy.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for admin roaster management
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRoasterDto {
    private Long id;
    private String name;
    private String description;
    private String location;
    private String website;
    private String logoUrl;
    private Boolean isVerified;
    private Instant createdAt;
    private Instant updatedAt;
}
