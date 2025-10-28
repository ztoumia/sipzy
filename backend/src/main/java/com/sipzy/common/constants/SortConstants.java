package com.sipzy.common.constants;

/**
 * Constants for sorting options across the application
 */
public final class SortConstants {

    private SortConstants() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    // Sort directions
    public static final String SORT_DESC = "desc";
    public static final String SORT_ASC = "asc";

    // Coffee sort fields
    public static final String COFFEE_SORT_RATING = "rating";
    public static final String COFFEE_SORT_CREATED_AT = "createdAt";
    public static final String COFFEE_SORT_NAME = "name";
    public static final String COFFEE_SORT_PRICE = "price";

    // Review sort fields
    public static final String REVIEW_SORT_HELPFUL = "helpful";
    public static final String REVIEW_SORT_RECENT = "recent";
    public static final String REVIEW_SORT_RATING = "rating";

    // User sort fields
    public static final String USER_SORT_USERNAME = "username";
    public static final String USER_SORT_CREATED_AT = "createdAt";
}
