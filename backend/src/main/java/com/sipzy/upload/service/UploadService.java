package com.sipzy.upload.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sipzy.upload.dto.response.UploadSignatureResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Upload Service - Generate Cloudinary upload signatures
 * Frontend uploads directly to Cloudinary with this signature
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UploadService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    /**
     * Generate signature for avatar upload
     * Frontend will upload directly to Cloudinary with this signature
     */
    public UploadSignatureResponse generateAvatarUploadSignature(Long userId) {
        log.info("Generating avatar upload signature for user: {}", userId);

        String folder = "avatars";
        String publicId = "user_" + userId + "_" + UUID.randomUUID();
        long timestamp = System.currentTimeMillis() / 1000;

        Map<String, Object> params = new HashMap<>();
        params.put("timestamp", timestamp);
        params.put("folder", folder);
        params.put("public_id", publicId);
        params.put("transformation", "c_fill,g_face,h_200,w_200");

        String signature = cloudinary.apiSignRequest(params, cloudinary.config.apiSecret);

        return new UploadSignatureResponse(
            signature,
            timestamp,
            cloudName,
            apiKey,
            folder,
            publicId
        );
    }

    /**
     * Generate signature for coffee image upload
     */
    public UploadSignatureResponse generateCoffeeImageUploadSignature(Long userId) {
        log.info("Generating coffee image upload signature for user: {}", userId);

        String folder = "coffees";
        String publicId = "coffee_" + UUID.randomUUID();
        long timestamp = System.currentTimeMillis() / 1000;

        Map<String, Object> params = new HashMap<>();
        params.put("timestamp", timestamp);
        params.put("folder", folder);
        params.put("public_id", publicId);
        params.put("transformation", "c_limit,h_600,w_800");

        String signature = cloudinary.apiSignRequest(params, cloudinary.config.apiSecret);

        return new UploadSignatureResponse(
            signature,
            timestamp,
            cloudName,
            apiKey,
            folder,
            publicId
        );
    }

    /**
     * Generate signature for review image upload
     */
    public UploadSignatureResponse generateReviewImageUploadSignature(Long userId) {
        log.info("Generating review image upload signature for user: {}", userId);

        String folder = "reviews";
        String publicId = "review_" + UUID.randomUUID();
        long timestamp = System.currentTimeMillis() / 1000;

        Map<String, Object> params = new HashMap<>();
        params.put("timestamp", timestamp);
        params.put("folder", folder);
        params.put("public_id", publicId);
        params.put("transformation", "c_limit,h_600,w_800");

        String signature = cloudinary.apiSignRequest(params, cloudinary.config.apiSecret);

        return new UploadSignatureResponse(
            signature,
            timestamp,
            cloudName,
            apiKey,
            folder,
            publicId
        );
    }

    /**
     * Delete an image from Cloudinary by URL
     * Extracts the public ID from the URL and deletes it
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            log.debug("No image URL provided, skipping deletion");
            return;
        }

        try {
            // Extract public ID from Cloudinary URL
            // Format: https://res.cloudinary.com/{cloudName}/image/upload/v{version}/{folder}/{publicId}.{format}
            String publicId = extractPublicIdFromUrl(imageUrl);

            if (publicId == null) {
                log.warn("Could not extract public ID from URL: {}", imageUrl);
                return;
            }

            log.info("Deleting image from Cloudinary: {}", publicId);
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

            String resultStatus = (String) result.get("result");
            if ("ok".equals(resultStatus)) {
                log.info("Image deleted successfully: {}", publicId);
            } else {
                log.warn("Image deletion returned status: {} for publicId: {}", resultStatus, publicId);
            }
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", imageUrl, e);
            // Don't throw exception - deletion is optional, don't fail the main operation
        }
    }

    /**
     * Extract public ID from Cloudinary URL
     * Example: https://res.cloudinary.com/mycloud/image/upload/v123456/avatars/user_1.jpg
     * Returns: avatars/user_1
     */
    private String extractPublicIdFromUrl(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }

        try {
            // Find the position after "/upload/"
            int uploadIndex = url.indexOf("/upload/");
            if (uploadIndex == -1) {
                return null;
            }

            // Skip past "/upload/v{version}/" or "/upload/"
            String afterUpload = url.substring(uploadIndex + 8); // "/upload/".length() = 8

            // Skip version if present (e.g., "v1234567890/")
            if (afterUpload.startsWith("v")) {
                int nextSlash = afterUpload.indexOf('/');
                if (nextSlash != -1) {
                    afterUpload = afterUpload.substring(nextSlash + 1);
                }
            }

            // Remove file extension
            int dotIndex = afterUpload.lastIndexOf('.');
            if (dotIndex != -1) {
                afterUpload = afterUpload.substring(0, dotIndex);
            }

            return afterUpload;
        } catch (Exception e) {
            log.error("Error extracting public ID from URL: {}", url, e);
            return null;
        }
    }
}
