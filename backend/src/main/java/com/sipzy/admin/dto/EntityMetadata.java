package com.sipzy.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Metadata describing an entity type
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityMetadata {
    private String name;
    private String displayName;
    private String tableName;
    private List<FieldMetadata> fields;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldMetadata {
        private String name;
        private String displayName;
        private String type; // string, number, boolean, date, enum, relation
        private boolean nullable;
        private boolean editable;
        private boolean primaryKey;
        private List<String> enumValues;
        private RelationInfo relation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelationInfo {
        private String entityType;
        private String displayField;
    }
}
