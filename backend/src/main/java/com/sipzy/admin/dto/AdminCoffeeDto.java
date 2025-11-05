package com.sipzy.admin.dto;

import com.sipzy.coffee.domain.Coffee.CoffeeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * DTO for admin coffee management
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCoffeeDto {
    private Long id;
    private String name;
    private Long roasterId;
    private String roasterName;
    private String origin;
    private String process;
    private String variety;
    private Integer altitudeMin;
    private Integer altitudeMax;
    private Integer harvestYear;
    private String priceRange;
    private String description;
    private String imageUrl;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private CoffeeStatus status;
    private Long submittedById;
    private String submittedByUsername;
    private Long moderatedById;
    private String moderatedByUsername;
    private String moderationReason;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant moderatedAt;
    private List<Long> noteIds;
    private List<String> noteNames;
}
