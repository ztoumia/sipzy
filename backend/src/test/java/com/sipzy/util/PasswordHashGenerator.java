package com.sipzy.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility to generate BCrypt password hashes
 * Run this to generate a new hash for admin password
 */
public class PasswordHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

        // Generate hashes for common passwords
        String[] passwords = {
            "Admin123!",
            "admin123",
            "Demo123!",
            "password123"
        };

        System.out.println("=== BCrypt Password Hash Generator (Strength: 12) ===\n");

        for (String password : passwords) {
            String hash = encoder.encode(password);
            System.out.println("Password: " + password);
            System.out.println("Hash:     " + hash);
            System.out.println();

            // Verify the hash works
            boolean matches = encoder.matches(password, hash);
            System.out.println("Verification: " + (matches ? "✅ PASS" : "❌ FAIL"));
            System.out.println("---");
            System.out.println();
        }

        // Test the existing hash from V6__seed_admin.sql
        System.out.println("=== Testing Existing Hash from Database ===\n");
        String existingHash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lwih.1Y9vJSOhK7va";

        for (String password : passwords) {
            boolean matches = encoder.matches(password, existingHash);
            System.out.println("Password '" + password + "': " + (matches ? "✅ MATCH" : "❌ NO MATCH"));
        }
    }
}
