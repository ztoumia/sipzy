package com.sipzy.coffee.controller;

import com.sipzy.coffee.dto.request.CoffeeFiltersRequest;
import com.sipzy.coffee.dto.request.CreateCoffeeRequest;
import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.coffee.service.CoffeeCommandService;
import com.sipzy.coffee.service.CoffeeQueryService;
import com.sipzy.common.dto.ApiResponse;
import com.sipzy.common.dto.PageResponse;
import com.sipzy.common.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller pour les cafés (CQRS: séparation lecture/écriture)
 * Architecture hexagonale: Point d'entrée API (Adapter)
 */
@Slf4j
@RestController
@RequestMapping("/api/coffees")
@RequiredArgsConstructor
@Tag(name = "Coffees", description = "Endpoints pour gérer les cafés")
public class CoffeeController {

    private final CoffeeQueryService coffeeQueryService;
    private final CoffeeCommandService coffeeCommandService;
    private final JwtUtil jwtUtil;

    @GetMapping
    @Operation(summary = "Liste des cafés", description = "Récupérer tous les cafés avec filtres et pagination")
    public ResponseEntity<PageResponse<CoffeeResponse>> getCoffees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> origin,
            @RequestParam(required = false) List<Long> roasterId,
            @RequestParam(required = false) List<Long> noteIds,
            @RequestParam(required = false) List<String> priceRange,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "rating") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit
    ) {
        log.info("Get coffees - page: {}, limit: {}", page, limit);

        CoffeeFiltersRequest filters = CoffeeFiltersRequest.builder()
                .search(search)
                .origin(origin)
                .roasterId(roasterId)
                .noteIds(noteIds)
                .priceRange(priceRange)
                .minRating(minRating)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .page(page)
                .limit(limit)
                .build();

        PageResponse<CoffeeResponse> response = coffeeQueryService.getAllCoffees(filters, page, limit);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail café", description = "Récupérer un café par son ID")
    public ResponseEntity<ApiResponse<CoffeeResponse>> getCoffeeById(@PathVariable Long id) {
        log.info("Get coffee by id: {}", id);

        CoffeeResponse response = coffeeQueryService.getCoffeeById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Créer café", description = "Proposer un nouveau café (status PENDING)")
    public ResponseEntity<ApiResponse<CoffeeResponse>> createCoffee(
            @Valid @RequestBody CreateCoffeeRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Create coffee: {}", request.getName());

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        CoffeeResponse response = coffeeCommandService.createCoffee(request, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier café", description = "Mettre à jour un café (owner ou admin)")
    public ResponseEntity<ApiResponse<CoffeeResponse>> updateCoffee(
            @PathVariable Long id,
            @Valid @RequestBody CreateCoffeeRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Update coffee id: {}", id);

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        CoffeeResponse response = coffeeCommandService.updateCoffee(id, request, userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer café", description = "Supprimer un café (admin uniquement)")
    public ResponseEntity<Void> deleteCoffee(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Delete coffee id: {}", id);

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        coffeeCommandService.deleteCoffee(id, userId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/popular")
    @Operation(summary = "Cafés populaires", description = "Top cafés par note")
    public ResponseEntity<ApiResponse<List<CoffeeResponse>>> getPopularCoffees(
            @RequestParam(defaultValue = "8") int limit
    ) {
        log.info("Get popular coffees, limit: {}", limit);

        List<CoffeeResponse> response = coffeeQueryService.getPopularCoffees(limit);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/recent")
    @Operation(summary = "Cafés récents", description = "Cafés récemment ajoutés")
    public ResponseEntity<ApiResponse<List<CoffeeResponse>>> getRecentCoffees(
            @RequestParam(defaultValue = "8") int limit
    ) {
        log.info("Get recent coffees, limit: {}", limit);

        List<CoffeeResponse> response = coffeeQueryService.getRecentCoffees(limit);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/similar")
    @Operation(summary = "Cafés similaires", description = "Cafés similaires par origine et notes")
    public ResponseEntity<ApiResponse<List<CoffeeResponse>>> getSimilarCoffees(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int limit
    ) {
        log.info("Get similar coffees for id: {}, limit: {}", id, limit);

        List<CoffeeResponse> response = coffeeQueryService.getSimilarCoffees(id, limit);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
