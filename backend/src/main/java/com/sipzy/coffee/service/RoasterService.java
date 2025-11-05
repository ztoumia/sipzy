package com.sipzy.coffee.service;

import com.sipzy.coffee.domain.Roaster;
import com.sipzy.coffee.dto.response.RoasterResponse;
import com.sipzy.coffee.mapper.RoasterMapper;
import com.sipzy.coffee.repository.RoasterRepository;
import com.sipzy.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for Roaster business logic
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoasterService {

    private final RoasterRepository roasterRepository;
    private final RoasterMapper roasterMapper;

    /**
     * Get all roasters
     */
    public List<RoasterResponse> getAllRoasters() {
        log.info("Getting all roasters");
        return roasterRepository.findAll()
                .stream()
                .map(roasterMapper::toRoasterResponse)
                .toList();
    }

    /**
     * Get roaster by ID
     */
    public RoasterResponse getRoasterById(Long id) {
        log.info("Getting roaster by id: {}", id);
        Roaster roaster = roasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Roaster", "id", id));
        return roasterMapper.toRoasterResponse(roaster);
    }
}
