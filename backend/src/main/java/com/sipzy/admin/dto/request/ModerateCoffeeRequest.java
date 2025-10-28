package com.sipzy.admin.dto.request;

/**
 * DTO pour modérer un café
 * Record: une seule propriété, pas de validation complexe
 */
public record ModerateCoffeeRequest(
        String adminNotes
) {
}
