package com.sipzy.user.service;

import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.coffee.mapper.CoffeeMapper;
import com.sipzy.coffee.repository.CoffeeRepository;
import com.sipzy.common.dto.PageResponse;
import com.sipzy.common.exception.ConflictException;
import com.sipzy.common.exception.ResourceNotFoundException;
import com.sipzy.user.domain.Favorite;
import com.sipzy.user.domain.User;
import com.sipzy.user.repository.FavoriteRepository;
import com.sipzy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing user favorites
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final CoffeeRepository coffeeRepository;
    private final CoffeeMapper coffeeMapper;

    /**
     * Add a coffee to user's favorites
     */
    @Transactional
    public void addFavorite(Long userId, Long coffeeId) {
        log.info("Adding coffee {} to favorites for user {}", coffeeId, userId);

        // Check if already exists
        if (favoriteRepository.existsByUserIdAndCoffeeId(userId, coffeeId)) {
            throw new ConflictException("Coffee is already in favorites");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Coffee coffee = coffeeRepository.findById(coffeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Coffee not found"));

        Favorite favorite = Favorite.builder()
                .user(user)
                .coffee(coffee)
                .build();

        favoriteRepository.save(favorite);
        log.info("Successfully added coffee {} to favorites for user {}", coffeeId, userId);
    }

    /**
     * Remove a coffee from user's favorites
     */
    @Transactional
    public void removeFavorite(Long userId, Long coffeeId) {
        log.info("Removing coffee {} from favorites for user {}", coffeeId, userId);

        Favorite favorite = favoriteRepository.findByUserIdAndCoffeeId(userId, coffeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorite not found"));

        favoriteRepository.delete(favorite);
        log.info("Successfully removed coffee {} from favorites for user {}", coffeeId, userId);
    }

    /**
     * Toggle favorite status
     */
    @Transactional
    public boolean toggleFavorite(Long userId, Long coffeeId) {
        log.info("Toggling favorite status for coffee {} and user {}", coffeeId, userId);

        if (favoriteRepository.existsByUserIdAndCoffeeId(userId, coffeeId)) {
            removeFavorite(userId, coffeeId);
            return false; // Removed
        } else {
            addFavorite(userId, coffeeId);
            return true; // Added
        }
    }

    /**
     * Check if coffee is in user's favorites
     */
    @Transactional(readOnly = true)
    public boolean isFavorite(Long userId, Long coffeeId) {
        return favoriteRepository.existsByUserIdAndCoffeeId(userId, coffeeId);
    }

    /**
     * Get all favorite coffees for a user with pagination
     */
    @Transactional(readOnly = true)
    public PageResponse<CoffeeResponse> getUserFavorites(Long userId, int page, int limit) {
        log.info("Getting favorites for user {} (page: {}, limit: {})", userId, page, limit);

        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Favorite> favoritesPage = favoriteRepository.findByUserIdWithCoffee(userId, pageable);

        List<CoffeeResponse> coffees = favoritesPage.getContent().stream()
                .map(favorite -> coffeeMapper.toCoffeeResponse(favorite.getCoffee()))
                .toList();

        return PageResponse.of(coffees, page, limit, favoritesPage.getTotalElements());
    }

    /**
     * Get all favorite coffee IDs for a user
     */
    @Transactional(readOnly = true)
    public List<Long> getUserFavoriteIds(Long userId) {
        log.info("Getting favorite IDs for user {}", userId);

        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        return favoriteRepository.findCoffeeIdsByUserId(userId);
    }

    /**
     * Get favorite count for a user
     */
    @Transactional(readOnly = true)
    public long getFavoriteCount(Long userId) {
        log.info("Getting favorite count for user {}", userId);

        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        return favoriteRepository.countByUserId(userId);
    }
}
