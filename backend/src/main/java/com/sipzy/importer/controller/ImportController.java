package com.sipzy.importer.controller;

import com.sipzy.common.dto.ApiResponse;
import com.sipzy.importer.dto.request.BatchImportRequest;
import com.sipzy.importer.dto.request.ImportCoffeeRequest;
import com.sipzy.importer.dto.request.ImportRoasterRequest;
import com.sipzy.importer.dto.response.ImportResponse;
import com.sipzy.importer.dto.response.ImportResult;
import com.sipzy.importer.service.ImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwaggerApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for importing coffee and roaster data.
 * Admin-only endpoints for bulk data import operations.
 */
@Slf4j
@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
@Tag(name = "Import", description = "Data import endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class ImportController {

    private final ImportService importService;

    /**
     * Import a single roaster.
     *
     * @param request The roaster import request
     * @return The import result
     */
    @PostMapping("/roaster")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Import a single roaster", description = "Import or update a roaster with image download support")
    @ApiResponses(value = {
            @SwaggerApiResponse(responseCode = "200", description = "Roaster imported successfully"),
            @SwaggerApiResponse(responseCode = "400", description = "Invalid request"),
            @SwaggerApiResponse(responseCode = "401", description = "Unauthorized"),
            @SwaggerApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    public ResponseEntity<ApiResponse<ImportResult>> importRoaster(@Valid @RequestBody ImportRoasterRequest request) {
        log.info("Import roaster request received: {}", request.getName());
        ImportResult result = importService.importRoaster(request);

        if (result.getSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(
                    "Roaster imported successfully",
                    result
            ));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(result.getErrorMessage()));
        }
    }

    /**
     * Import a single coffee.
     *
     * @param request The coffee import request
     * @return The import result
     */
    @PostMapping("/coffee")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Import a single coffee", description = "Import or update a coffee with image download support")
    @ApiResponses(value = {
            @SwaggerApiResponse(responseCode = "200", description = "Coffee imported successfully"),
            @SwaggerApiResponse(responseCode = "400", description = "Invalid request"),
            @SwaggerApiResponse(responseCode = "401", description = "Unauthorized"),
            @SwaggerApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    public ResponseEntity<ApiResponse<ImportResult>> importCoffee(@Valid @RequestBody ImportCoffeeRequest request) {
        log.info("Import coffee request received: {}", request.getName());
        ImportResult result = importService.importCoffee(request);

        if (result.getSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(
                    "Coffee imported successfully",
                    result
            ));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(result.getErrorMessage()));
        }
    }

    /**
     * Batch import roasters and coffees.
     *
     * @param request The batch import request
     * @return The import response with all results
     */
    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Batch import roasters and coffees",
            description = "Import multiple roasters and coffees in a single request with optional error handling"
    )
    @ApiResponses(value = {
            @SwaggerApiResponse(responseCode = "200", description = "Batch import completed"),
            @SwaggerApiResponse(responseCode = "400", description = "Invalid request"),
            @SwaggerApiResponse(responseCode = "401", description = "Unauthorized"),
            @SwaggerApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    public ResponseEntity<ApiResponse<ImportResponse>> batchImport(@Valid @RequestBody BatchImportRequest request) {
        log.info("Batch import request received: {} roasters, {} coffees",
                request.getRoasters() != null ? request.getRoasters().size() : 0,
                request.getCoffees() != null ? request.getCoffees().size() : 0);

        ImportResponse response = importService.batchImport(request);

        return ResponseEntity.ok(ApiResponse.success(
                response.getMessage(),
                response
        ));
    }

    /**
     * Import multiple roasters.
     *
     * @param requests List of roaster import requests
     * @return The import response
     */
    @PostMapping("/roasters")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Import multiple roasters", description = "Import multiple roasters in a single request")
    @ApiResponses(value = {
            @SwaggerApiResponse(responseCode = "200", description = "Roasters import completed"),
            @SwaggerApiResponse(responseCode = "400", description = "Invalid request"),
            @SwaggerApiResponse(responseCode = "401", description = "Unauthorized"),
            @SwaggerApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    public ResponseEntity<ApiResponse<ImportResponse>> importRoasters(@Valid @RequestBody List<ImportRoasterRequest> requests) {
        log.info("Import multiple roasters request received: {} roasters", requests.size());

        BatchImportRequest batchRequest = BatchImportRequest.builder()
                .roasters(requests)
                .continueOnError(true)
                .build();

        ImportResponse response = importService.batchImport(batchRequest);

        return ResponseEntity.ok(ApiResponse.success(
                response.getMessage(),
                response
        ));
    }

    /**
     * Import multiple coffees.
     *
     * @param requests List of coffee import requests
     * @return The import response
     */
    @PostMapping("/coffees")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Import multiple coffees", description = "Import multiple coffees in a single request")
    @ApiResponses(value = {
            @SwaggerApiResponse(responseCode = "200", description = "Coffees import completed"),
            @SwaggerApiResponse(responseCode = "400", description = "Invalid request"),
            @SwaggerApiResponse(responseCode = "401", description = "Unauthorized"),
            @SwaggerApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    public ResponseEntity<ApiResponse<ImportResponse>> importCoffees(
            @Valid @RequestBody List<ImportCoffeeRequest> requests,
            @RequestParam(required = false, defaultValue = "false") Boolean autoApprove
    ) {
        log.info("Import multiple coffees request received: {} coffees, autoApprove: {}",
                requests.size(), autoApprove);

        BatchImportRequest batchRequest = BatchImportRequest.builder()
                .coffees(requests)
                .continueOnError(true)
                .autoApprove(autoApprove)
                .build();

        ImportResponse response = importService.batchImport(batchRequest);

        return ResponseEntity.ok(ApiResponse.success(
                response.getMessage(),
                response
        ));
    }

    /**
     * Health check endpoint for the import service.
     *
     * @return Health status
     */
    @GetMapping("/health")
    @Operation(summary = "Import service health check", description = "Check if the import service is operational")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success(
                "Import service is operational",
                "OK"
        ));
    }
}
