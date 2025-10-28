package com.sipzy.user.service;

import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.coffee.mapper.CoffeeMapper;
import com.sipzy.coffee.repository.CoffeeRepository;
import com.sipzy.common.dto.PageResponse;
import com.sipzy.common.exception.ResourceNotFoundException;
import com.sipzy.review.domain.Review;
import com.sipzy.review.dto.response.ReviewResponse;
import com.sipzy.review.mapper.ReviewMapper;
import com.sipzy.review.repository.ReviewRepository;
import com.sipzy.user.domain.User;
import com.sipzy.user.dto.response.UserPreferencesResponse;
import com.sipzy.user.dto.response.UserProfileResponse;
import com.sipzy.user.dto.response.UserResponse;
import com.sipzy.user.dto.response.UserStats;
import com.sipzy.user.mapper.UserMapper;
import com.sipzy.user.repository.UserRepository;
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
 * User Query Service (CQRS Read Side)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserQueryService {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final CoffeeRepository coffeeRepository;
    private final UserMapper userMapper;
    private final ReviewMapper reviewMapper;
    private final CoffeeMapper coffeeMapper;

    public UserResponse getUserById(Long id) {
        log.info("Getting user by id: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        return userMapper.toUserResponse(user);
    }

    public UserResponse getUserByUsername(String username) {
        log.info("Getting user by username: {}", username);

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        return userMapper.toUserResponse(user);
    }

    public UserProfileResponse getUserProfile(Long id) {
        log.info("Getting user profile: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Get user stats
        UserStats stats = getUserStats(id);

        // Get recent reviews (limit 3)
        Pageable reviewPageable = PageRequest.of(0, 3);
        List<ReviewResponse> recentReviews = reviewRepository.findByUserId(id, reviewPageable)
            .stream()
            .map(reviewMapper::toReviewResponse)
            .collect(Collectors.toList());

        // Get approved coffees (limit 3)
        Pageable coffeePageable = PageRequest.of(0, 3);
        List<CoffeeResponse> approvedCoffees = coffeeRepository.findBySubmittedById(id, coffeePageable)
            .stream()
            .filter(Coffee::isApproved)
            .map(coffeeMapper::toCoffeeResponse)
            .collect(Collectors.toList());

        return new UserProfileResponse(
            userMapper.toUserResponse(user),
            stats,
            recentReviews,
            approvedCoffees
        );
    }

    public UserStats getUserStats(Long userId) {
        log.info("Getting user stats: {}", userId);

        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Count total reviews
        int totalReviews = (int) reviewRepository.findByUserId(userId, Pageable.unpaged()).getTotalElements();

        // Count total coffees submitted
        int totalCoffees = (int) coffeeRepository.findBySubmittedById(userId, Pageable.unpaged()).getTotalElements();

        // Calculate average rating given by user
        Double averageRating = reviewRepository.findByUserId(userId, Pageable.unpaged())
            .stream()
            .mapToInt(Review::getRating)
            .average()
            .orElse(0.0);

        // Count helpful votes received on user's reviews
        int helpfulVotes = reviewRepository.findByUserId(userId, Pageable.unpaged())
            .stream()
            .mapToInt(Review::getHelpfulCount)
            .sum();

        return new UserStats(totalReviews, totalCoffees, averageRating, helpfulVotes);
    }

    public PageResponse<ReviewResponse> getUserReviews(Long userId, int page, int limit) {
        log.info("Getting reviews for user: {}", userId);

        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Review> reviewPage = reviewRepository.findByUserId(userId, pageable);

        List<ReviewResponse> reviews = reviewPage.getContent().stream()
            .map(reviewMapper::toReviewResponse)
            .collect(Collectors.toList());

        return PageResponse.of(reviews, page, limit, reviewPage.getTotalElements());
    }

    public PageResponse<CoffeeResponse> getUserCoffees(Long userId, int page, int limit) {
        log.info("Getting coffees for user: {}", userId);

        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Coffee> coffeePage = coffeeRepository.findBySubmittedById(userId, pageable);

        // Only return approved coffees for public view
        List<CoffeeResponse> coffees = coffeePage.getContent().stream()
            .filter(Coffee::isApproved)
            .map(coffeeMapper::toCoffeeResponse)
            .collect(Collectors.toList());

        long approvedCount = coffeePage.getContent().stream()
            .filter(Coffee::isApproved)
            .count();

        return PageResponse.of(coffees, page, limit, approvedCount);
    }

    public UserPreferencesResponse getUserPreferences(Long userId) {
        log.info("Getting preferences for user: {}", userId);

        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // For now, return default preferences (could be stored in database later)
        return new UserPreferencesResponse(true, true, true);
    }
}
