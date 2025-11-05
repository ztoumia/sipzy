package com.sipzy.user.controller;

import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.common.dto.ApiResponse;
import com.sipzy.common.dto.PageResponse;
import com.sipzy.common.util.JwtUtil;
import com.sipzy.user.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for managing user favorites
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Favorites", description = "Endpoints pour gérer les favoris")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final JwtUtil jwtUtil;

    @PostMapping("/favorites/{coffeeId}")
    @Operation(summary = "Ajouter aux favoris", description = "Ajouter un café aux favoris")
    public ResponseEntity<ApiResponse<Void>> addFavorite(
            @PathVariable Long coffeeId,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Adding coffee {} to favorites", coffeeId);

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        favoriteService.addFavorite(userId, coffeeId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(null, "Coffee added to favorites"));
    }

    @DeleteMapping("/favorites/{coffeeId}")
    @Operation(summary = "Retirer des favoris", description = "Retirer un café des favoris")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable Long coffeeId,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Removing coffee {} from favorites", coffeeId);

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        favoriteService.removeFavorite(userId, coffeeId);

        return ResponseEntity.ok(ApiResponse.success(null, "Coffee removed from favorites"));
    }

    @PostMapping("/favorites/{coffeeId}/toggle")
    @Operation(summary = "Basculer favori", description = "Ajouter ou retirer des favoris")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleFavorite(
            @PathVariable Long coffeeId,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Toggling favorite for coffee {}", coffeeId);

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        boolean isFavorite = favoriteService.toggleFavorite(userId, coffeeId);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("isFavorite", isFavorite),
                isFavorite ? "Coffee added to favorites" : "Coffee removed from favorites"
        ));
    }

    @GetMapping("/favorites/{coffeeId}/check")
    @Operation(summary = "Vérifier favori", description = "Vérifier si un café est dans les favoris")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkFavorite(
            @PathVariable Long coffeeId,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Checking if coffee {} is favorite", coffeeId);

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        boolean isFavorite = favoriteService.isFavorite(userId, coffeeId);

        return ResponseEntity.ok(ApiResponse.success(Map.of("isFavorite", isFavorite)));
    }

    @GetMapping("/favorites")
    @Operation(summary = "Liste des favoris", description = "Obtenir tous les cafés favoris")
    public ResponseEntity<PageResponse<CoffeeResponse>> getUserFavorites(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Getting favorites (page: {}, limit: {})", page, limit);

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        PageResponse<CoffeeResponse> response = favoriteService.getUserFavorites(userId, page, limit);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/favorites/ids")
    @Operation(summary = "IDs des favoris", description = "Obtenir les IDs de tous les cafés favoris")
    public ResponseEntity<ApiResponse<List<Long>>> getUserFavoriteIds(
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Getting favorite IDs");

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        List<Long> favoriteIds = favoriteService.getUserFavoriteIds(userId);

        return ResponseEntity.ok(ApiResponse.success(favoriteIds));
    }

    @GetMapping("/favorites/count")
    @Operation(summary = "Nombre de favoris", description = "Obtenir le nombre de favoris")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getFavoriteCount(
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Getting favorite count");

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        long count = favoriteService.getFavoriteCount(userId);

        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }
}
