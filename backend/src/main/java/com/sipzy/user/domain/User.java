package com.sipzy.user.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Entité User - Domaine métier
 * Architecture hexagonale: Core domain
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true),
        @Index(name = "idx_users_username", columnList = "username", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserRole role = UserRole.USER;

    @Column(length = 500)
    private String avatarUrl;

    @Column(length = 500)
    private String bio;

    @Column(length = 100)
    private String location;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(length = 255)
    private String verificationToken;

    @Column
    private Instant verificationTokenExpiresAt;

    @Column(length = 255)
    private String passwordResetToken;

    @Column
    private Instant passwordResetTokenExpiresAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    // Enum pour les rôles
    public enum UserRole {
        USER,
        ADMIN
    }

    // Méthodes métier
    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }

    public boolean canModerate() {
        return isAdmin();
    }

    public void verify() {
        this.isVerified = true;
        this.verificationToken = null;
        this.verificationTokenExpiresAt = null;
    }

    public void generatePasswordResetToken(String token, Instant expiresAt) {
        this.passwordResetToken = token;
        this.passwordResetTokenExpiresAt = expiresAt;
    }

    public void clearPasswordResetToken() {
        this.passwordResetToken = null;
        this.passwordResetTokenExpiresAt = null;
    }
}
