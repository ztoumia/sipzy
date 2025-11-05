package com.sipzy.importer.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for importing roaster data.
 * Supports both creation and update operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportRoasterRequest {

    /**
     * Existing roaster ID for update operations.
     * If null, a new roaster will be created.
     */
    private Long id;

    /**
     * Roaster name (required for creation).
     */
    @NotBlank(message = "Roaster name is required")
    @Size(max = 100, message = "Roaster name must not exceed 100 characters")
    private String name;

    /**
     * Roaster description.
     */
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    /**
     * Roaster location.
     */
    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    /**
     * Roaster website URL.
     */
    @Size(max = 500, message = "Website URL must not exceed 500 characters")
    private String website;

    /**
     * Logo URL or image URL to be downloaded and uploaded to Cloudinary.
     */
    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;

    /**
     * Whether the roaster is verified.
     */
    private Boolean isVerified;
}
