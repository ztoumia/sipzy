package com.sipzy.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Utility to generate BCrypt password hashes for database seeds
 * Run this main method to generate hashes for test users
 */
public class PasswordHashGenerator {

    public static void main(String[] args) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

        String adminPassword = "admin123";
        String demoPassword = "demo123";

        String adminHash = passwordEncoder.encode(adminPassword);
        String demoHash = passwordEncoder.encode(demoPassword);

        System.out.println("========================================");
        System.out.println("BCrypt Password Hashes (strength 12)");
        System.out.println("========================================");
        System.out.println();
        System.out.println("Admin User:");
        System.out.println("  Email: admin@sipzy.coffee");
        System.out.println("  Password: " + adminPassword);
        System.out.println("  Hash: " + adminHash);
        System.out.println();
        System.out.println("Demo User:");
        System.out.println("  Email: demo@sipzy.coffee");
        System.out.println("  Password: " + demoPassword);
        System.out.println("  Hash: " + demoHash);
        System.out.println();
        System.out.println("========================================");
        System.out.println("SQL Migration:");
        System.out.println("========================================");
        System.out.println();
        System.out.println("-- Update admin password");
        System.out.println("UPDATE users SET password_hash = '" + adminHash + "' WHERE email = 'admin@sipzy.coffee';");
        System.out.println();
        System.out.println("-- Update demo password");
        System.out.println("UPDATE users SET password_hash = '" + demoHash + "' WHERE email = 'demo@sipzy.coffee';");
        System.out.println();

        // Verify the hashes work
        System.out.println("========================================");
        System.out.println("Verification:");
        System.out.println("========================================");
        System.out.println("Admin password matches: " + passwordEncoder.matches(adminPassword, adminHash));
        System.out.println("Demo password matches: " + passwordEncoder.matches(demoPassword, demoHash));
    }
}
