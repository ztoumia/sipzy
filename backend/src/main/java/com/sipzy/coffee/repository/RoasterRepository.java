package com.sipzy.coffee.repository;

import com.sipzy.coffee.domain.Roaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoasterRepository extends JpaRepository<Roaster, Long> {

    Optional<Roaster> findByName(String name);

    boolean existsByName(String name);
}
