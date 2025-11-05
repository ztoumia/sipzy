package com.sipzy.admin.repository;

import com.sipzy.admin.domain.Activity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Activity entity
 */
@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    /**
     * Find recent activities with pagination
     */
    List<Activity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
