package com.sipzy.admin.controller;

import com.sipzy.admin.dto.request.ModerateCoffeeRequest;
import com.sipzy.admin.dto.response.AdminStatsResponse;
import com.sipzy.admin.dto.request.BanUserRequest;
import com.sipzy.admin.dto.request.ModerateReportRequest;
import com.sipzy.admin.dto.response.ReportResponse;
import com.sipzy.admin.service.AdminService;
import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.common.dto.ApiResponse;
import com.sipzy.common.dto.PageResponse;
import com.sipzy.common.util.JwtUtil;
import com.sipzy.user.dto.response.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller pour l'administration (réservé aux ADMIN)
 * Architecture hexagonale: Point d'entrée API (Adapter)
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Endpoints d'administration")
public class AdminController {

    private final AdminService adminService;
    private final JwtUtil jwtUtil;

    @GetMapping("/stats")
    @Operation(summary = "Statistiques dashboard", description = "Stats admin globales")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        log.info("Get admin stats");

        AdminStatsResponse response = adminService.getStats();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/coffees/pending")
    @Operation(summary = "Cafés en attente", description = "Liste des cafés à modérer")
    public ResponseEntity<PageResponse<CoffeeResponse>> getPendingCoffees(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        log.info("Get pending coffees - page: {}, limit: {}", page, limit);

        PageResponse<CoffeeResponse> response = adminService.getPendingCoffees(page, limit);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/coffees/{id}/approve")
    @Operation(summary = "Approuver café", description = "Approuver un café en attente")
    public ResponseEntity<ApiResponse<CoffeeResponse>> approveCoffee(
            @PathVariable Long id,
            @Valid @RequestBody ModerateCoffeeRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Approve coffee id: {}", id);

        Long adminId = jwtUtil.extractUserIdFromHeader(authHeader);
        CoffeeResponse response = adminService.approveCoffee(id, adminId, request.adminNotes());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/coffees/{id}/reject")
    @Operation(summary = "Rejeter café", description = "Rejeter un café en attente")
    public ResponseEntity<ApiResponse<CoffeeResponse>> rejectCoffee(
            @PathVariable Long id,
            @Valid @RequestBody ModerateCoffeeRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Reject coffee id: {}", id);

        Long adminId = jwtUtil.extractUserIdFromHeader(authHeader);
        CoffeeResponse response = adminService.rejectCoffee(id, adminId, request.adminNotes());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/coffees")
    @Operation(summary = "Tous les cafés admin", description = "Cafés avec tous statuts")
    public ResponseEntity<PageResponse<CoffeeResponse>> getAllCoffees(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        log.info("Get all coffees admin - status: {}, page: {}", status, page);

        PageResponse<CoffeeResponse> response = adminService.getAllCoffees(status, search, page, limit);

        return ResponseEntity.ok(response);
    }

    // ==================== User Management ====================

    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "List all users with pagination")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        log.info("Get all users - page: {}, limit: {}", page, limit);

        PageResponse<UserResponse> response = adminService.getAllUsers(page, limit);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}/ban")
    @Operation(summary = "Ban user", description = "Ban a user account")
    public ResponseEntity<ApiResponse<UserResponse>> banUser(
            @PathVariable Long id,
            @Valid @RequestBody BanUserRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Ban user id: {}", id);

        Long adminId = jwtUtil.extractUserIdFromHeader(authHeader);
        UserResponse response = adminService.banUser(id, adminId, request.getReason());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/users/{id}/unban")
    @Operation(summary = "Unban user", description = "Unban a user account")
    public ResponseEntity<ApiResponse<UserResponse>> unbanUser(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Unban user id: {}", id);

        Long adminId = jwtUtil.extractUserIdFromHeader(authHeader);
        UserResponse response = adminService.unbanUser(id, adminId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== Report Moderation ====================

    @GetMapping("/reports/pending")
    @Operation(summary = "Get pending reports", description = "List all reports awaiting moderation")
    public ResponseEntity<PageResponse<ReportResponse>> getPendingReports(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        log.info("Get pending reports - page: {}, limit: {}", page, limit);

        PageResponse<ReportResponse> response = adminService.getPendingReports(page, limit);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports")
    @Operation(summary = "Get all reports", description = "List all reports with optional status filter")
    public ResponseEntity<PageResponse<ReportResponse>> getAllReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        log.info("Get all reports - status: {}, page: {}", status, page);

        PageResponse<ReportResponse> response = adminService.getAllReports(status, page, limit);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/reports/{id}/resolve")
    @Operation(summary = "Resolve report", description = "Mark report as resolved (action was taken)")
    public ResponseEntity<ApiResponse<ReportResponse>> resolveReport(
            @PathVariable Long id,
            @Valid @RequestBody ModerateReportRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Resolve report id: {}", id);

        Long adminId = jwtUtil.extractUserIdFromHeader(authHeader);
        ReportResponse response = adminService.resolveReport(id, adminId, request.getAdminNotes());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/reports/{id}/dismiss")
    @Operation(summary = "Dismiss report", description = "Mark report as dismissed (no action needed)")
    public ResponseEntity<ApiResponse<ReportResponse>> dismissReport(
            @PathVariable Long id,
            @Valid @RequestBody ModerateReportRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Dismiss report id: {}", id);

        Long adminId = jwtUtil.extractUserIdFromHeader(authHeader);
        ReportResponse response = adminService.dismissReport(id, adminId, request.getAdminNotes());

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
