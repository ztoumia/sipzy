package com.sipzy.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sipzy.auth.dto.request.LoginRequest;
import com.sipzy.auth.dto.request.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration Tests for AuthController using full Spring Boot configuration
 * These are real integration tests without mocking - they test the entire stack
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("AuthController API Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/register - Should register user successfully")
    void registerUser_Success() throws Exception {
        // Given - real integration test, no mocking
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser" + System.currentTimeMillis()); // Unique username
        request.setEmail("test" + System.currentTimeMillis() + "@example.com"); // Unique email
        request.setPassword("SecurePass123!");

        // When & Then
        String responseContent = mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        System.out.println("Register Response: " + responseContent);

        // Verify response structure
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict()); // Should fail on second attempt (duplicate email)
    }

    // Note: @WebMvcTest doesn't automatically enable Bean Validation
    // Validation tests should be done in integration tests with @SpringBootTest
    // These tests focus on controller behavior with valid requests

    @Test
    @DisplayName("POST /api/auth/login - Should login successfully")
    void loginUser_Success() throws Exception {
        // Given - First create a user to login with
        String username = "loginuser" + System.currentTimeMillis();
        String email = "login" + System.currentTimeMillis() + "@example.com";
        String password = "LoginPass123!";

        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername(username);
        registerRequest.setEmail(email);
        registerRequest.setPassword(password);

        // Register the user first
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        // Now login with the registered user
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.username").value(username))
                .andExpect(jsonPath("$.data.user.email").value(email))
                .andExpect(jsonPath("$.timestamp").exists());
    }


    @Test
    @WithMockUser
    @DisplayName("POST /api/auth/logout - Should logout successfully")
    void logoutUser_Success() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                        .with(csrf())
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isNoContent());
    }
}
