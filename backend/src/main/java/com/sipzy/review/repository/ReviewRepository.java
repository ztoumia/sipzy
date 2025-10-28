package com.sipzy.review.repository;

import com.sipzy.review.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByCoffeeId(Long coffeeId, Pageable pageable);

    Page<Review> findByUserId(Long userId, Pageable pageable);

    boolean existsByCoffeeIdAndUserId(Long coffeeId, Long userId);

    // Find reviews sorted by helpful count
    @Query("SELECT r FROM Review r WHERE r.coffee.id = :coffeeId ORDER BY r.helpfulCount DESC")
    Page<Review> findByCoffeeIdOrderByHelpfulCountDesc(Long coffeeId, Pageable pageable);

    // Find recent reviews globally
    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    Page<Review> findRecentReviews(Pageable pageable);
}
