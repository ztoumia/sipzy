package com.sipzy.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * Standard error response for API errors
 * Provides consistent error structure across all endpoints
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    @Builder.Default
    private Boolean success = false;

    private Integer status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> validationErrors;

    @Builder.Default
    private Instant timestamp = Instant.now();

    // Legacy nested error detail (kept for backwards compatibility if needed)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDetail {
        private String code;
        private String message;
        private Map<String, Object> details;
    }

    // Factory methods for convenience
    public static ErrorResponse of(String error, String message) {
        return ErrorResponse.builder()
                .error(error)
                .message(message)
                .build();
    }

    public static ErrorResponse of(Integer status, String error, String message, String path) {
        return ErrorResponse.builder()
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .build();
    }
}
