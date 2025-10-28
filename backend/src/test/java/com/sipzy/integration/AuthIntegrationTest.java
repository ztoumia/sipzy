package com.sipzy.integration;

import com.sipzy.auth.dto.request.LoginRequest;
import com.sipzy.auth.dto.request.RegisterRequest;
import com.sipzy.auth.dto.response.AuthResponse;
import com.sipzy.auth.service.AuthService;
import com.sipzy.common.exception.ConflictException;
import com.sipzy.common.exception.UnauthorizedException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for Authentication flow
 * Uses Testcontainers to spin up a real PostgreSQL database
 */
@SpringBootTest
@Testcontainers
@Transactional
@DisplayName("Auth Integration Tests")
class AuthIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("sipzy_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("Should register and login user successfully")
    void registerAndLoginUser_Success() {
        // Given - Register
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("john_doe");
        registerRequest.setEmail("john@example.com");
        registerRequest.setPassword("SecurePass123!");

        // When - Register
        AuthResponse registerResponse = authService.register(registerRequest);

        // Then - Verify registration
        assertNotNull(registerResponse);
        assertNotNull(registerResponse.token());
        assertNotNull(registerResponse.user());
        assertEquals("john_doe", registerResponse.user().username());
        assertEquals("john@example.com", registerResponse.user().email());
        assertEquals("USER", registerResponse.user().role());

        // Given - Login
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("john@example.com");
        loginRequest.setPassword("SecurePass123!");

        // When - Login
        AuthResponse loginResponse = authService.login(loginRequest);

        // Then - Verify login
        assertNotNull(loginResponse);
        assertNotNull(loginResponse.token());
        assertEquals("john_doe", loginResponse.user().username());
    }

    @Test
    @DisplayName("Should prevent duplicate email registration")
    void registerDuplicateEmail_ThrowsConflictException() {
        // Given - First registration
        RegisterRequest firstRequest = new RegisterRequest();
        firstRequest.setUsername("user1");
        firstRequest.setEmail("duplicate@example.com");
        firstRequest.setPassword("Password123!");

        authService.register(firstRequest);

        // Given - Second registration with same email
        RegisterRequest secondRequest = new RegisterRequest();
        secondRequest.setUsername("user2");
        secondRequest.setEmail("duplicate@example.com");
        secondRequest.setPassword("Password123!");

        // When & Then
        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> authService.register(secondRequest)
        );

        assertTrue(exception.getMessage().contains("Email already registered"));
    }

    @Test
    @DisplayName("Should prevent duplicate username registration")
    void registerDuplicateUsername_ThrowsConflictException() {
        // Given - First registration
        RegisterRequest firstRequest = new RegisterRequest();
        firstRequest.setUsername("duplicateuser");
        firstRequest.setEmail("user1@example.com");
        firstRequest.setPassword("Password123!");

        authService.register(firstRequest);

        // Given - Second registration with same username
        RegisterRequest secondRequest = new RegisterRequest();
        secondRequest.setUsername("duplicateuser");
        secondRequest.setEmail("user2@example.com");
        secondRequest.setPassword("Password123!");

        // When & Then
        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> authService.register(secondRequest)
        );

        assertTrue(exception.getMessage().contains("Username already taken"));
    }

    @Test
    @DisplayName("Should fail login with incorrect password")
    void loginWithIncorrectPassword_ThrowsUnauthorizedException() {
        // Given - Register user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("CorrectPass123!");

        authService.register(registerRequest);

        // Given - Login with wrong password
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("WrongPassword!");

        // When & Then
        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> authService.login(loginRequest)
        );

        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    @DisplayName("Should fail login with non-existent email")
    void loginWithNonExistentEmail_ThrowsUnauthorizedException() {
        // Given
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("nonexistent@example.com");
        loginRequest.setPassword("Password123!");

        // When & Then
        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> authService.login(loginRequest)
        );

        assertEquals("Invalid email or password", exception.getMessage());
    }
}
