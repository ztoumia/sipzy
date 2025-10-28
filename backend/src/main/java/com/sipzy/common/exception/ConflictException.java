package com.sipzy.common.exception;

/**
 * Exception thrown when there is a conflict with existing data (e.g., duplicate email)
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }

    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
