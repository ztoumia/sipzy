package com.sipzy.importer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result of a single import operation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResult {

    /**
     * Type of entity being imported (ROASTER, COFFEE).
     */
    private EntityType entityType;

    /**
     * Operation performed (CREATE, UPDATE, SKIP).
     */
    private Operation operation;

    /**
     * ID of the entity after import.
     */
    private Long entityId;

    /**
     * Name/description of the entity.
     */
    private String entityName;

    /**
     * Whether the import was successful.
     */
    private Boolean success;

    /**
     * Error message if import failed.
     */
    private String errorMessage;

    /**
     * Warnings or additional information.
     */
    private String warning;

    public enum EntityType {
        ROASTER,
        COFFEE
    }

    public enum Operation {
        CREATE,
        UPDATE,
        SKIP,
        ERROR
    }

    /**
     * Create a successful result.
     */
    public static ImportResult success(EntityType type, Operation operation, Long id, String name) {
        return ImportResult.builder()
                .entityType(type)
                .operation(operation)
                .entityId(id)
                .entityName(name)
                .success(true)
                .build();
    }

    /**
     * Create a successful result with warning.
     */
    public static ImportResult successWithWarning(EntityType type, Operation operation, Long id, String name, String warning) {
        return ImportResult.builder()
                .entityType(type)
                .operation(operation)
                .entityId(id)
                .entityName(name)
                .success(true)
                .warning(warning)
                .build();
    }

    /**
     * Create an error result.
     */
    public static ImportResult error(EntityType type, String name, String errorMessage) {
        return ImportResult.builder()
                .entityType(type)
                .operation(Operation.ERROR)
                .entityName(name)
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }
}
