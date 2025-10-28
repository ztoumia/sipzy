package com.sipzy.upload.dto.response;

/**
 * DTO pour la signature d'upload Cloudinary
 * Utilisé pour permettre au frontend d'uploader directement à Cloudinary
 */
public record UploadSignatureResponse(
        String signature,
        Long timestamp,
        String cloudName,
        String apiKey,
        String folder,
        String publicId
) {
}
