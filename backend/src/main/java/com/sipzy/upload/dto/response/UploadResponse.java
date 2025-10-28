package com.sipzy.upload.dto.response;

/**
 * DTO pour la réponse d'upload
 * Record: immutable, concis, pas besoin de Builder
 */
public record UploadResponse(
        String url,
        String filename,
        Long size,
        String type
) {
}
