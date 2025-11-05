package com.sipzy.user.repository;

import com.sipzy.user.domain.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Favorite entity
 */
@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    /**
     * Find favorite by user ID and coffee ID
     */
    @Query("SELECT f FROM Favorite f WHERE f.user.id = :userId AND f.coffee.id = :coffeeId")
    Optional<Favorite> findByUserIdAndCoffeeId(@Param("userId") Long userId, @Param("coffeeId") Long coffeeId);

    /**
     * Check if a favorite exists for user and coffee
     */
    @Query("SELECT COUNT(f) > 0 FROM Favorite f WHERE f.user.id = :userId AND f.coffee.id = :coffeeId")
    boolean existsByUserIdAndCoffeeId(@Param("userId") Long userId, @Param("coffeeId") Long coffeeId);

    /**
     * Get all favorites for a user with pagination
     */
    @Query("SELECT f FROM Favorite f JOIN FETCH f.coffee c LEFT JOIN FETCH c.roaster WHERE f.user.id = :userId")
    Page<Favorite> findByUserIdWithCoffee(@Param("userId") Long userId, Pageable pageable);

    /**
     * Get all favorite coffee IDs for a user
     */
    @Query("SELECT f.coffee.id FROM Favorite f WHERE f.user.id = :userId")
    List<Long> findCoffeeIdsByUserId(@Param("userId") Long userId);

    /**
     * Count favorites for a user
     */
    @Query("SELECT COUNT(f) FROM Favorite f WHERE f.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * Delete favorite by user ID and coffee ID
     */
    @Query("DELETE FROM Favorite f WHERE f.user.id = :userId AND f.coffee.id = :coffeeId")
    void deleteByUserIdAndCoffeeId(@Param("userId") Long userId, @Param("coffeeId") Long coffeeId);
}
