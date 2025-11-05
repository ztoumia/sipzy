package com.sipzy.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Quick utility to generate the correct BCrypt hash for Admin123!
 * Run this to get the correct hash to put in the database
 */
public class GenerateAdminHash {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

        String password = "Admin123!";

        System.out.println("=== Generating BCrypt Hash for Admin Password ===");
        System.out.println();
        System.out.println("Password: " + password);
        System.out.println();

        // Generate 3 different hashes to show they're all valid
        for (int i = 1; i <= 3; i++) {
            String hash = encoder.encode(password);
            System.out.println("Hash #" + i + ": " + hash);

            // Verify it works
            boolean matches = encoder.matches(password, hash);
            System.out.println("Verification: " + (matches ? "✅ VALID" : "❌ INVALID"));
            System.out.println();
        }

        System.out.println("=== SQL Update Command ===");
        System.out.println();
        String finalHash = encoder.encode(password);
        System.out.println("UPDATE users");
        System.out.println("SET password_hash = '" + finalHash + "',");
        System.out.println("    updated_at = CURRENT_TIMESTAMP");
        System.out.println("WHERE email = 'admin@sipzy.coffee';");
        System.out.println();

        // Test the old hash
        System.out.println("=== Testing OLD hash from V6__seed_admin.sql ===");
        String oldHash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lwih.1Y9vJSOhK7va";
        System.out.println("Old hash: " + oldHash);

        String[] testPasswords = {"Admin123!", "admin123", "Admin123", "admin", "password"};
        for (String testPwd : testPasswords) {
            boolean matches = encoder.matches(testPwd, oldHash);
            System.out.println("  '" + testPwd + "': " + (matches ? "✅ MATCH" : "❌ NO MATCH"));
        }
    }
}
