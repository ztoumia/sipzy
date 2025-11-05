package com.sipzy.importer.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for importing coffee data.
 * Supports both creation and update operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportCoffeeRequest {

    /**
     * Existing coffee ID for update operations.
     * If null, a new coffee will be created.
     */
    private Long id;

    /**
     * Coffee name (required).
     */
    @NotBlank(message = "Coffee name is required")
    @Size(min = 3, max = 255, message = "Coffee name must be between 3 and 255 characters")
    private String name;

    /**
     * Roaster ID (required for creation).
     * If roaster doesn't exist, import will fail.
     */
    @NotNull(message = "Roaster ID is required")
    private Long roasterId;

    /**
     * Alternative: roaster name to lookup or create.
     * If roasterId is null, will try to find roaster by name.
     */
    private String roasterName;

    /**
     * Coffee origin/country.
     */
    @Size(max = 100, message = "Origin must not exceed 100 characters")
    private String origin;

    /**
     * Processing method (e.g., Washed, Natural, Honey).
     */
    @Size(max = 50, message = "Process must not exceed 50 characters")
    private String process;

    /**
     * Coffee variety (e.g., Arabica, Robusta).
     */
    @Size(max = 100, message = "Variety must not exceed 100 characters")
    private String variety;

    /**
     * Minimum altitude in meters.
     */
    @Min(value = 0, message = "Minimum altitude must be >= 0")
    @Max(value = 5000, message = "Minimum altitude must be <= 5000")
    private Integer altitudeMin;

    /**
     * Maximum altitude in meters.
     */
    @Min(value = 0, message = "Maximum altitude must be >= 0")
    @Max(value = 5000, message = "Maximum altitude must be <= 5000")
    private Integer altitudeMax;

    /**
     * Harvest year.
     */
    @Min(value = 2000, message = "Harvest year must be >= 2000")
    private Integer harvestYear;

    /**
     * Price range (€, €€, €€€, €€€€).
     */
    @Pattern(regexp = "^€{1,4}$", message = "Price range must be €, €€, €€€, or €€€€")
    private String priceRange;

    /**
     * Coffee description.
     */
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    /**
     * Image URL to be downloaded and uploaded to Cloudinary.
     */
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    /**
     * List of note IDs to associate with the coffee.
     */
    @Size(min = 1, max = 10, message = "Must provide between 1 and 10 notes")
    private List<Long> noteIds;

    /**
     * Alternative: note names to lookup.
     * Will try to find notes by name if noteIds is empty.
     */
    private List<String> noteNames;

    /**
     * User ID who is submitting this coffee.
     * If null, will use admin user or system user.
     */
    private Long submittedById;

    /**
     * Whether to auto-approve the coffee after import.
     * Default is false (coffee will be in PENDING status).
     */
    private Boolean autoApprove;
}
