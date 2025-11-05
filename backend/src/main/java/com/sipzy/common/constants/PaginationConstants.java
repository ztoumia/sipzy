package com.sipzy.common.constants;

/**
 * Constants for pagination across all endpoints
 * Centralizes default values to ensure consistency
 */
public final class PaginationConstants {

    private PaginationConstants() {
        // Prevent instantiation
    }

    /**
     * Default page number (1-indexed)
     */
    public static final int DEFAULT_PAGE = 1;

    /**
     * Standard limit for most list endpoints
     */
    public static final int DEFAULT_LIMIT = 10;

    /**
     * Limit for coffee grid layout (3x4 grid)
     */
    public static final int COFFEE_GRID_LIMIT = 12;

    /**
     * Higher limit for admin views
     */
    public static final int ADMIN_LIMIT = 20;

    /**
     * Maximum allowed limit to prevent performance issues
     */
    public static final int MAX_LIMIT = 100;

    /**
     * Maximum page number to prevent unreasonable queries
     */
    public static final int MAX_PAGE = 10000;

    /**
     * String representations for @RequestParam defaultValue
     */
    public static final String DEFAULT_PAGE_STR = "1";
    public static final String DEFAULT_LIMIT_STR = "10";
    public static final String COFFEE_GRID_LIMIT_STR = "12";
    public static final String ADMIN_LIMIT_STR = "20";
}
