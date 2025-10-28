package com.sipzy.review.service;

import com.sipzy.common.dto.PageResponse;
import com.sipzy.common.exception.ResourceNotFoundException;
import com.sipzy.review.domain.Review;
import com.sipzy.review.dto.response.ReviewResponse;
import com.sipzy.review.mapper.ReviewMapper;
import com.sipzy.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Review Query Service (CQRS Read Side)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReviewQueryService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    public PageResponse<ReviewResponse> getReviewsByCoffeeId(Long coffeeId, String sortBy, int page, int limit) {
        log.info("Getting reviews for coffee id: {}, sortBy: {}", coffeeId, sortBy);

        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Review> reviewPage;

        if ("helpful".equalsIgnoreCase(sortBy)) {
            reviewPage = reviewRepository.findByCoffeeIdOrderByHelpfulCountDesc(coffeeId, pageable);
        } else {
            reviewPage = reviewRepository.findByCoffeeId(coffeeId, pageable);
        }

        List<ReviewResponse> reviews = reviewPage.getContent().stream()
            .map(reviewMapper::toReviewResponse)
            .collect(Collectors.toList());

        return PageResponse.of(reviews, page, limit, reviewPage.getTotalElements());
    }

    public List<ReviewResponse> getRecentReviews(int limit) {
        log.info("Getting recent reviews, limit: {}", limit);

        Pageable pageable = PageRequest.of(0, limit);
        return reviewRepository.findRecentReviews(pageable).stream()
            .map(reviewMapper::toReviewResponse)
            .collect(Collectors.toList());
    }

    public ReviewResponse getReviewById(Long id) {
        log.info("Getting review by id: {}", id);

        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        return reviewMapper.toReviewResponse(review);
    }
}
