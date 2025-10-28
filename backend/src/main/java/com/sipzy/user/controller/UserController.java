package com.sipzy.user.controller;

import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.common.dto.ApiResponse;
import com.sipzy.common.dto.PageResponse;
import com.sipzy.common.util.JwtUtil;
import com.sipzy.review.dto.response.ReviewResponse;
import com.sipzy.user.dto.request.UpdateProfileRequest;
import com.sipzy.user.dto.response.UserPreferencesResponse;
import com.sipzy.user.dto.response.UserProfileResponse;
import com.sipzy.user.dto.response.UserResponse;
import com.sipzy.user.service.UserCommandService;
import com.sipzy.user.service.UserQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Endpoints pour gérer les utilisateurs")
public class UserController {

    private final UserQueryService userQueryService;
    private final UserCommandService userCommandService;
    private final JwtUtil jwtUtil;

    @GetMapping("/{id}")
    @Operation(summary = "Profil utilisateur", description = "Récupérer un profil public par ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        log.info("Get user by id: {}", id);

        UserResponse response = userQueryService.getUserById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/username/{username}")
    @Operation(summary = "Profil par username", description = "Récupérer un profil par username")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByUsername(@PathVariable String username) {
        log.info("Get user by username: {}", username);

        UserResponse response = userQueryService.getUserByUsername(username);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/profile")
    @Operation(summary = "Profil complet", description = "Profil avec statistiques")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(@PathVariable Long id) {
        log.info("Get user profile: {}", id);

        UserProfileResponse response = userQueryService.getUserProfile(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Modifier profil", description = "Mettre à jour son profil")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Update profile");

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        UserResponse response = userCommandService.updateProfile(userId, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Avis utilisateur", description = "Tous les avis d'un utilisateur")
    public ResponseEntity<PageResponse<ReviewResponse>> getUserReviews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        log.info("Get user reviews: {}", id);

        PageResponse<ReviewResponse> response = userQueryService.getUserReviews(id, page, limit);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/coffees")
    @Operation(summary = "Cafés utilisateur", description = "Cafés soumis approuvés")
    public ResponseEntity<PageResponse<CoffeeResponse>> getUserCoffees(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        log.info("Get user coffees: {}", id);

        PageResponse<CoffeeResponse> response = userQueryService.getUserCoffees(id, page, limit);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/preferences")
    @Operation(summary = "Préférences utilisateur", description = "Récupérer les préférences")
    public ResponseEntity<ApiResponse<UserPreferencesResponse>> getPreferences(
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Get user preferences");

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        UserPreferencesResponse response = userQueryService.getUserPreferences(userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/preferences")
    @Operation(summary = "Mettre à jour préférences", description = "Sauvegarder les préférences")
    public ResponseEntity<ApiResponse<String>> updatePreferences(
            @Valid @RequestBody UserPreferencesResponse request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Update user preferences");

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        userCommandService.updatePreferences(userId, request);

        return ResponseEntity.ok(ApiResponse.success(null, "Preferences updated successfully"));
    }
}
