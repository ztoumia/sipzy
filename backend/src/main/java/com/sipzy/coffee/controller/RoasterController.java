package com.sipzy.coffee.controller;

import com.sipzy.coffee.dto.response.RoasterResponse;
import com.sipzy.coffee.service.RoasterService;
import com.sipzy.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Roaster endpoints
 */
@Slf4j
@RestController
@RequestMapping("/api/roasters")
@RequiredArgsConstructor
@Tag(name = "Roasters", description = "Endpoints pour gérer les torréfacteurs")
public class RoasterController {

    private final RoasterService roasterService;

    @GetMapping
    @Operation(summary = "Liste des torréfacteurs", description = "Récupérer tous les torréfacteurs")
    public ResponseEntity<ApiResponse<List<RoasterResponse>>> getAllRoasters() {
        log.info("Get all roasters");
        List<RoasterResponse> response = roasterService.getAllRoasters();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail torréfacteur", description = "Récupérer un torréfacteur par son ID")
    public ResponseEntity<ApiResponse<RoasterResponse>> getRoasterById(@PathVariable Long id) {
        log.info("Get roaster by id: {}", id);
        RoasterResponse response = roasterService.getRoasterById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
