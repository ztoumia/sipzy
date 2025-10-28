package com.sipzy.admin.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO to moderate a report
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerateReportRequest {

    @Size(max = 2000, message = "Admin notes must not exceed 2000 characters")
    private String adminNotes;
}
