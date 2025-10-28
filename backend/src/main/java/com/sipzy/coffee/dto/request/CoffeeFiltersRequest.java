package com.sipzy.coffee.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Query DTO pour filtrer les cafés (CQRS - Query)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoffeeFiltersRequest {

    private String search;
    private List<String> origin;
    private List<Long> roasterId;
    private List<Long> noteIds;
    private List<String> priceRange;
    private Double minRating;

    @Builder.Default
    private String sortBy = "rating"; // name, rating, reviews, created

    @Builder.Default
    private String sortOrder = "desc"; // asc, desc

    @Builder.Default
    private Integer page = 1;

    @Builder.Default
    private Integer limit = 12;
}
