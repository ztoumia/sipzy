package com.sipzy.common.constants;

/**
 * Constants for pagination defaults across the application
 */
public final class PaginationConstants {

    private PaginationConstants() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    // Default page number (1-indexed)
    public static final int DEFAULT_PAGE = 1;

    // Default limits for different entity types
    public static final int DEFAULT_LIMIT_SMALL = 6;
    public static final int DEFAULT_LIMIT_STANDARD = 10;
    public static final int DEFAULT_LIMIT_MEDIUM = 12;
    public static final int DEFAULT_LIMIT_LARGE = 20;

    // Specific entity defaults
    public static final int COFFEES_DEFAULT_LIMIT = 12;
    public static final int REVIEWS_DEFAULT_LIMIT = 10;
    public static final int ADMIN_DEFAULT_LIMIT = 20;
    public static final int ACTIVITY_DEFAULT_LIMIT = 10;
    public static final int POPULAR_ITEMS_LIMIT = 8;
    public static final int RECENT_ITEMS_LIMIT = 8;
    public static final int SIMILAR_ITEMS_LIMIT = 4;
    public static final int RECENT_REVIEWS_LIMIT = 6;

    // Maximum allowed limits (for security/performance)
    public static final int MAX_LIMIT = 100;
}
