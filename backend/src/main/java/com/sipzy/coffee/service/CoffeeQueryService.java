package com.sipzy.coffee.service;

import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.dto.request.CoffeeFiltersRequest;
import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.coffee.mapper.CoffeeMapper;
import com.sipzy.coffee.repository.CoffeeRepository;
import com.sipzy.common.dto.PageResponse;
import com.sipzy.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Coffee Query Service (CQRS Read Side)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CoffeeQueryService {

    private final CoffeeRepository coffeeRepository;
    private final CoffeeMapper coffeeMapper;

    public PageResponse<CoffeeResponse> getAllCoffees(CoffeeFiltersRequest filters, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);

        String origin = (filters.getOrigin() != null && !filters.getOrigin().isEmpty())
            ? filters.getOrigin().get(0) : null;
        Long roasterId = (filters.getRoasterId() != null && !filters.getRoasterId().isEmpty())
            ? filters.getRoasterId().get(0) : null;
        BigDecimal minRating = filters.getMinRating() != null
            ? BigDecimal.valueOf(filters.getMinRating()) : null;

        Page<Coffee> coffeePage = coffeeRepository.searchWithFilters(
            filters.getSearch(),
            origin,
            roasterId,
            minRating,
            filters.getNoteIds(),
            pageable
        );

        List<CoffeeResponse> coffees = coffeePage.getContent().stream()
            .map(coffeeMapper::toCoffeeResponse)
            .collect(Collectors.toList());

        return PageResponse.of(coffees, page, limit, coffeePage.getTotalElements());
    }

    @Cacheable(value = "coffees", key = "#id")
    public CoffeeResponse getCoffeeById(Long id) {
        Coffee coffee = coffeeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Coffee not found with id: " + id));

        return coffeeMapper.toCoffeeResponse(coffee);
    }

    @Cacheable(value = "popularCoffees", key = "#limit")
    public List<CoffeeResponse> getPopularCoffees(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return coffeeRepository.findPopularCoffees(pageable).stream()
            .map(coffeeMapper::toCoffeeResponse)
            .collect(Collectors.toList());
    }

    @Cacheable(value = "recentCoffees", key = "#limit")
    public List<CoffeeResponse> getRecentCoffees(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return coffeeRepository.findRecentCoffees(pageable).stream()
            .map(coffeeMapper::toCoffeeResponse)
            .collect(Collectors.toList());
    }

    public List<CoffeeResponse> getSimilarCoffees(Long coffeeId, int limit) {
        Coffee coffee = coffeeRepository.findById(coffeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Coffee not found"));

        // For now, use empty list if notes relationship not set up
        List<Long> noteIds = Collections.emptyList();

        Pageable pageable = PageRequest.of(0, limit);
        return coffeeRepository.findSimilarCoffees(coffeeId, coffee.getOrigin(), noteIds, pageable).stream()
            .map(coffeeMapper::toCoffeeResponse)
            .collect(Collectors.toList());
    }
}
