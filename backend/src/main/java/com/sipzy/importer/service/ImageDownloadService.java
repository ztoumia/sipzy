package com.sipzy.importer.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.Map;
import java.util.UUID;

/**
 * Service for downloading images from external URLs and uploading to Cloudinary.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImageDownloadService {

    private final Cloudinary cloudinary;

    private static final int CONNECT_TIMEOUT = 10000; // 10 seconds
    private static final int READ_TIMEOUT = 30000; // 30 seconds
    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

    /**
     * Download an image from a URL and upload it to Cloudinary.
     *
     * @param imageUrl The URL of the image to download
     * @param folder   The Cloudinary folder (e.g., "coffees", "roasters")
     * @return The Cloudinary URL of the uploaded image, or null if failed
     */
    public String downloadAndUploadImage(String imageUrl, String folder) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }

        try {
            log.info("Downloading image from URL: {}", imageUrl);

            // Download image
            byte[] imageData = downloadImage(imageUrl);
            if (imageData == null) {
                log.warn("Failed to download image from URL: {}", imageUrl);
                return null;
            }

            // Upload to Cloudinary
            String cloudinaryUrl = uploadToCloudinary(imageData, folder);
            log.info("Successfully uploaded image to Cloudinary: {}", cloudinaryUrl);
            return cloudinaryUrl;

        } catch (Exception e) {
            log.error("Error downloading and uploading image from URL: {}", imageUrl, e);
            return null;
        }
    }

    /**
     * Download image data from a URL.
     *
     * @param imageUrl The URL to download from
     * @return The image data as a byte array, or null if failed
     */
    private byte[] downloadImage(String imageUrl) {
        HttpURLConnection connection = null;
        try {
            // Parse and validate URL
            URI uri = new URI(imageUrl);
            URL url = uri.toURL();

            // Open connection
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(CONNECT_TIMEOUT);
            connection.setReadTimeout(READ_TIMEOUT);
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "Sipzy-Import-Bot/1.0");

            // Check response code
            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                log.warn("Failed to download image, HTTP response code: {}", responseCode);
                return null;
            }

            // Check content type
            String contentType = connection.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                log.warn("URL does not point to an image, content type: {}", contentType);
                return null;
            }

            // Check content length
            long contentLength = connection.getContentLengthLong();
            if (contentLength > MAX_IMAGE_SIZE) {
                log.warn("Image size ({} bytes) exceeds maximum allowed size ({} bytes)",
                        contentLength, MAX_IMAGE_SIZE);
                return null;
            }

            // Read image data
            try (InputStream inputStream = connection.getInputStream()) {
                return inputStream.readAllBytes();
            }

        } catch (Exception e) {
            log.error("Error downloading image from URL: {}", imageUrl, e);
            return null;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    /**
     * Upload image data to Cloudinary.
     *
     * @param imageData The image data as a byte array
     * @param folder    The Cloudinary folder
     * @return The Cloudinary URL of the uploaded image
     * @throws IOException If upload fails
     */
    private String uploadToCloudinary(byte[] imageData, String folder) throws IOException {
        String publicId = String.format("%s/%s", folder, UUID.randomUUID().toString());

        Map<String, Object> uploadParams = ObjectUtils.asMap(
                "public_id", publicId,
                "folder", folder,
                "resource_type", "image",
                "overwrite", false
        );

        // Add transformation based on folder
        if ("coffees".equals(folder)) {
            uploadParams.put("transformation", ObjectUtils.asMap(
                    "crop", "limit",
                    "height", 600,
                    "width", 800
            ));
        } else if ("roasters".equals(folder)) {
            uploadParams.put("transformation", ObjectUtils.asMap(
                    "crop", "fill",
                    "height", 200,
                    "width", 200
            ));
        }

        Map<?, ?> uploadResult = cloudinary.uploader().upload(imageData, uploadParams);
        return (String) uploadResult.get("secure_url");
    }

    /**
     * Validate if a URL is accessible without downloading the full content.
     *
     * @param imageUrl The URL to validate
     * @return true if the URL is accessible, false otherwise
     */
    public boolean validateImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return false;
        }

        HttpURLConnection connection = null;
        try {
            URI uri = new URI(imageUrl);
            URL url = uri.toURL();

            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(CONNECT_TIMEOUT);
            connection.setRequestMethod("HEAD");
            connection.setRequestProperty("User-Agent", "Sipzy-Import-Bot/1.0");

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                return false;
            }

            String contentType = connection.getContentType();
            return contentType != null && contentType.startsWith("image/");

        } catch (Exception e) {
            log.debug("Image URL validation failed: {}", imageUrl, e);
            return false;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}
