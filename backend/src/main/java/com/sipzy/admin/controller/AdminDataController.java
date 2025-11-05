package com.sipzy.admin.controller;

import com.sipzy.admin.dto.EntityMetadata;
import com.sipzy.admin.service.AdminDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for admin data management
 * Provides CRUD operations for all entities
 */
@RestController
@RequestMapping("/api/admin/data")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminDataController {

    private final AdminDataService adminDataService;

    /**
     * Get metadata for all available entities
     * GET /api/admin/data/metadata
     */
    @GetMapping("/metadata")
    public ResponseEntity<List<EntityMetadata>> getEntityMetadata() {
        log.info("Getting entity metadata");
        List<EntityMetadata> metadata = adminDataService.getEntityMetadataList();
        return ResponseEntity.ok(metadata);
    }

    /**
     * Get all data for a specific entity type with pagination
     * GET /api/admin/data/{entityType}
     */
    @GetMapping("/{entityType}")
    public ResponseEntity<Map<String, Object>> getEntityData(
            @PathVariable String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        log.info("Getting data for entity type: {}, page: {}, size: {}", entityType, page, size);
        Map<String, Object> data = adminDataService.getEntityData(entityType, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(data);
    }

    /**
     * Get a specific entity by ID
     * GET /api/admin/data/{entityType}/{id}
     */
    @GetMapping("/{entityType}/{id}")
    public ResponseEntity<Object> getEntityById(
            @PathVariable String entityType,
            @PathVariable Long id
    ) {
        log.info("Getting {} with id: {}", entityType, id);
        Object entity = adminDataService.getEntityById(entityType, id);
        return ResponseEntity.ok(entity);
    }

    /**
     * Update an entity
     * PUT /api/admin/data/{entityType}/{id}
     */
    @PutMapping("/{entityType}/{id}")
    public ResponseEntity<Object> updateEntity(
            @PathVariable String entityType,
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates
    ) {
        log.info("Updating {} with id: {}", entityType, id);
        Object updated = adminDataService.updateEntity(entityType, id, updates);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete an entity
     * DELETE /api/admin/data/{entityType}/{id}
     */
    @DeleteMapping("/{entityType}/{id}")
    public ResponseEntity<Void> deleteEntity(
            @PathVariable String entityType,
            @PathVariable Long id
    ) {
        log.info("Deleting {} with id: {}", entityType, id);
        adminDataService.deleteEntity(entityType, id);
        return ResponseEntity.noContent().build();
    }
}
