package com.sipzy.admin.dto.response;

/**
 * DTO pour les statistiques admin
 * Record: données simples, immutables
 */
public record AdminStatsResponse(
        Integer totalCoffees,
        Integer totalUsers,
        Integer totalReviews,
        Integer pendingCoffees,
        Integer pendingReports,
        Integer approvedCoffees,
        Integer rejectedCoffees
) {
}
