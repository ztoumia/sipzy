package com.sipzy.upload.controller;

import com.sipzy.common.dto.ApiResponse;
import com.sipzy.common.util.JwtUtil;
import com.sipzy.upload.dto.response.UploadSignatureResponse;
import com.sipzy.upload.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller pour l'upload de fichiers
 * Architecture hexagonale: Point d'entrée API (Adapter)
 *
 * Le frontend utilise ces signatures pour uploader directement à Cloudinary
 */
@Slf4j
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Tag(name = "Upload", description = "Endpoints pour générer des signatures d'upload Cloudinary")
public class UploadController {

    private final UploadService uploadService;
    private final JwtUtil jwtUtil;

    @GetMapping("/signature/avatar")
    @Operation(
        summary = "Signature upload avatar",
        description = "Génère une signature pour uploader un avatar directement à Cloudinary"
    )
    public ResponseEntity<ApiResponse<UploadSignatureResponse>> getAvatarUploadSignature(
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Generating avatar upload signature");

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        UploadSignatureResponse response = uploadService.generateAvatarUploadSignature(userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/signature/coffee-image")
    @Operation(
        summary = "Signature upload image café",
        description = "Génère une signature pour uploader une image de café directement à Cloudinary"
    )
    public ResponseEntity<ApiResponse<UploadSignatureResponse>> getCoffeeImageUploadSignature(
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Generating coffee image upload signature");

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        UploadSignatureResponse response = uploadService.generateCoffeeImageUploadSignature(userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/signature/review-image")
    @Operation(
        summary = "Signature upload image avis",
        description = "Génère une signature pour uploader une image d'avis directement à Cloudinary"
    )
    public ResponseEntity<ApiResponse<UploadSignatureResponse>> getReviewImageUploadSignature(
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Generating review image upload signature");

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        UploadSignatureResponse response = uploadService.generateReviewImageUploadSignature(userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
