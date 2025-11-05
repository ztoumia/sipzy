package com.sipzy.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for admin note management
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminNoteDto {
    private Long id;
    private String name;
    private String category;
    private Instant createdAt;
}
