package com.sipzy.coffee.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Command DTO pour créer un café (CQRS - Command)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCoffeeRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 255, message = "Name must be between 3 and 255 characters")
    private String name;

    @NotNull(message = "RoasterId is required")
    private Long roasterId;

    @Size(max = 100, message = "Origin must be max 100 characters")
    private String origin;

    @Size(max = 50, message = "Process must be max 50 characters")
    private String process;

    @Size(max = 100, message = "Variety must be max 100 characters")
    private String variety;

    @Min(value = 0, message = "Altitude min must be >= 0")
    @Max(value = 5000, message = "Altitude min must be <= 5000")
    private Integer altitudeMin;

    @Min(value = 0, message = "Altitude max must be >= 0")
    @Max(value = 5000, message = "Altitude max must be <= 5000")
    private Integer altitudeMax;

    @Min(value = 2000, message = "Harvest year must be >= 2000")
    private Integer harvestYear;

    @Pattern(regexp = "^€{1,4}$", message = "Price range must be €, €€, €€€ or €€€€")
    private String priceRange;

    @Size(max = 2000, message = "Description must be max 2000 characters")
    private String description;

    private String imageUrl;

    @NotNull(message = "At least one note is required")
    @Size(min = 1, max = 10, message = "Number of notes must be between 1 and 10")
    private List<Long> noteIds;
}
