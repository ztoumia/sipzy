package com.sipzy.common.constants;

/**
 * Constants for validation rules across the application
 */
public final class ValidationConstants {

    private ValidationConstants() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    // User validation
    public static final int USERNAME_MIN_LENGTH = 3;
    public static final int USERNAME_MAX_LENGTH = 50;
    public static final int PASSWORD_MIN_LENGTH = 8;
    public static final int PASSWORD_MAX_LENGTH = 100;
    public static final int EMAIL_MAX_LENGTH = 255;
    public static final int BIO_MAX_LENGTH = 500;
    public static final int LOCATION_MAX_LENGTH = 100;

    // Coffee validation
    public static final int COFFEE_NAME_MIN_LENGTH = 3;
    public static final int COFFEE_NAME_MAX_LENGTH = 100;
    public static final int COFFEE_DESCRIPTION_MAX_LENGTH = 2000;
    public static final int COFFEE_ORIGIN_MAX_LENGTH = 100;
    public static final int COFFEE_PROCESS_MAX_LENGTH = 50;
    public static final int COFFEE_VARIETY_MAX_LENGTH = 100;
    public static final int COFFEE_MIN_ALTITUDE = 0;
    public static final int COFFEE_MAX_ALTITUDE = 3000;
    public static final int COFFEE_MIN_HARVEST_YEAR = 2000;
    public static final double COFFEE_MIN_PRICE = 0.0;

    // Review validation
    public static final int REVIEW_COMMENT_MIN_LENGTH = 10;
    public static final int REVIEW_COMMENT_MAX_LENGTH = 2000;
    public static final int REVIEW_MIN_RATING = 1;
    public static final int REVIEW_MAX_RATING = 5;

    // Admin validation
    public static final int BAN_REASON_MIN_LENGTH = 10;
    public static final int BAN_REASON_MAX_LENGTH = 500;
    public static final int ADMIN_NOTES_MAX_LENGTH = 1000;
    public static final int MODERATION_REASON_MAX_LENGTH = 500;

    // File upload validation
    public static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    public static final long MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB
    public static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"};
}
