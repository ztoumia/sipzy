package com.sipzy.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sipzy.auth.controller.AuthController;
import com.sipzy.auth.dto.request.LoginRequest;
import com.sipzy.auth.dto.request.RegisterRequest;
import com.sipzy.auth.dto.response.AuthResponse;
import com.sipzy.auth.service.AuthService;
import com.sipzy.user.dto.response.UserResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * API Tests for AuthController using MockMvc
 */
@WebMvcTest(AuthController.class)
@Import(com.sipzy.config.SecurityConfig.class)
@DisplayName("AuthController API Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private com.sipzy.config.security.JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.sipzy.security.RateLimitFilter rateLimitFilter;

    @MockBean
    private com.sipzy.config.RateLimitConfig rateLimitConfig;

    @MockBean(name = "rateLimitBuckets")
    private java.util.Map<String, Object> rateLimitBuckets;

    @Test
    @DisplayName("POST /api/auth/register - Should register user successfully")
    void registerUser_Success() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@example.com");
        request.setPassword("SecurePass123!");

        UserResponse userResponse = new UserResponse(
                1L, "newuser", "newuser@example.com", "USER",
                null, null, true, false, null, null
        );

        AuthResponse response = new AuthResponse(userResponse, "jwt-token-here");

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt-token-here"))
                .andExpect(jsonPath("$.data.user.username").value("newuser"))
                .andExpect(jsonPath("$.data.user.email").value("newuser@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/register - Should fail with invalid email")
    void registerUser_InvalidEmail_BadRequest() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("invalid-email");  // Invalid email format
        request.setPassword("SecurePass123!");

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register - Should fail with short password")
    void registerUser_ShortPassword_BadRequest() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@example.com");
        request.setPassword("short");  // Too short

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login - Should login successfully")
    void loginUser_Success() throws Exception {
        // Given
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("Password123!");

        UserResponse userResponse = new UserResponse(
                1L, "user", "user@example.com", "USER",
                null, null, true, true, null, null
        );

        AuthResponse response = new AuthResponse(userResponse, "jwt-token-here");

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt-token-here"))
                .andExpect(jsonPath("$.data.user.username").value("user"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Should fail with missing credentials")
    void loginUser_MissingCredentials_BadRequest() throws Exception {
        // Given
        LoginRequest request = new LoginRequest();
        // Missing email and password

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/auth/logout - Should logout successfully")
    void logoutUser_Success() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
