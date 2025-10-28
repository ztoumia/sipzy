package com.sipzy.coffee.repository;

import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.domain.CoffeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CoffeeRepository extends JpaRepository<Coffee, Long> {

    Page<Coffee> findByStatus(CoffeeStatus status, Pageable pageable);

    Page<Coffee> findByRoasterId(Long roasterId, Pageable pageable);

    Page<Coffee> findByOrigin(String origin, Pageable pageable);

    Page<Coffee> findBySubmittedById(Long submittedById, Pageable pageable);

    // Popular coffees (highest rating)
    @Query("SELECT c FROM Coffee c WHERE c.status = 'APPROVED' ORDER BY c.averageRating DESC, c.reviewCount DESC")
    List<Coffee> findPopularCoffees(Pageable pageable);

    // Recent coffees
    @Query("SELECT c FROM Coffee c WHERE c.status = 'APPROVED' ORDER BY c.createdAt DESC")
    List<Coffee> findRecentCoffees(Pageable pageable);

    // Search with filters
    @Query("SELECT DISTINCT c FROM Coffee c " +
           "LEFT JOIN c.notes n " +
           "WHERE c.status = 'APPROVED' " +
           "AND (:search = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:origin = '' OR c.origin = :origin) " +
           "AND (:roasterId IS NULL OR c.roaster.id = :roasterId) " +
           "AND (:minRating IS NULL OR c.averageRating >= :minRating) " +
           "AND (:noteIds IS NULL OR n.id IN :noteIds)")
    Page<Coffee> searchWithFilters(
        @Param("search") String search,
        @Param("origin") String origin,
        @Param("roasterId") Long roasterId,
        @Param("minRating") BigDecimal minRating,
        @Param("noteIds") List<Long> noteIds,
        Pageable pageable
    );

    // Similar coffees by origin and notes
    @Query("SELECT DISTINCT c FROM Coffee c " +
           "LEFT JOIN c.notes n " +
           "WHERE c.status = 'APPROVED' " +
           "AND c.id != :coffeeId " +
           "AND (c.origin = :origin OR n.id IN :noteIds) " +
           "ORDER BY c.averageRating DESC")
    List<Coffee> findSimilarCoffees(
        @Param("coffeeId") Long coffeeId,
        @Param("origin") String origin,
        @Param("noteIds") List<Long> noteIds,
        Pageable pageable
    );
}
