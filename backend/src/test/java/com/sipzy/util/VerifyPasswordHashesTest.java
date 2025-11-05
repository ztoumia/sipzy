package com.sipzy.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test to verify the password hashes used in V11 migration
 */
class VerifyPasswordHashesTest {

    @Test
    void verifyAdminPasswordHash() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();

        // Hash from V11 migration for admin123
        String adminHash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY2FkWBqH.mmiKu";
        String adminPassword = "admin123";

        boolean matches = encoder.matches(adminPassword, adminHash);

        System.out.println("\n=== Admin Password Verification ===");
        System.out.println("Password: " + adminPassword);
        System.out.println("Hash: " + adminHash);
        System.out.println("Matches: " + matches);

        assertTrue(matches, "Admin password 'admin123' should match the hash from V11 migration");
    }

    @Test
    void verifyDemoPasswordHash() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();

        // Hash from V11 migration for demo123
        String demoHash = "$2a$12$wjjcoiVHaXD8rJ8MzTkSI.yBKVIj5F9pLXzPVg4W4mf6L2NTQjWXS";
        String demoPassword = "demo123";

        boolean matches = encoder.matches(demoPassword, demoHash);

        System.out.println("\n=== Demo Password Verification ===");
        System.out.println("Password: " + demoPassword);
        System.out.println("Hash: " + demoHash);
        System.out.println("Matches: " + matches);

        assertTrue(matches, "Demo password 'demo123' should match the hash from V11 migration");
    }

    @Test
    void generateCorrectHashes() {
        PasswordEncoder encoder = new BCryptPasswordEncoder(12);

        String adminPassword = "admin123";
        String demoPassword = "demo123";

        String newAdminHash = encoder.encode(adminPassword);
        String newDemoHash = encoder.encode(demoPassword);

        System.out.println("\n=== Newly Generated Hashes ===");
        System.out.println("\nAdmin:");
        System.out.println("  Password: " + adminPassword);
        System.out.println("  New Hash: " + newAdminHash);
        System.out.println("  Verifies: " + encoder.matches(adminPassword, newAdminHash));

        System.out.println("\nDemo:");
        System.out.println("  Password: " + demoPassword);
        System.out.println("  New Hash: " + newDemoHash);
        System.out.println("  Verifies: " + encoder.matches(demoPassword, newDemoHash));

        System.out.println("\n=== SQL for V12 Migration ===");
        System.out.println("UPDATE users SET password_hash = '" + newAdminHash + "' WHERE email = 'admin@sipzy.coffee';");
        System.out.println("UPDATE users SET password_hash = '" + newDemoHash + "' WHERE email = 'demo@sipzy.coffee';");
    }
}
