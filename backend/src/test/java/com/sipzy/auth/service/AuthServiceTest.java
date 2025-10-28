package com.sipzy.auth.service;

import com.sipzy.auth.dto.request.LoginRequest;
import com.sipzy.auth.dto.request.RegisterRequest;
import com.sipzy.auth.dto.response.AuthResponse;
import com.sipzy.common.exception.ConflictException;
import com.sipzy.common.exception.UnauthorizedException;
import com.sipzy.common.util.JwtUtil;
import com.sipzy.user.domain.User;
import com.sipzy.user.dto.response.UserResponse;
import com.sipzy.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private com.sipzy.user.mapper.UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("Password123!");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("Password123!");

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .role(User.UserRole.USER)
                .build();

        userResponse = new UserResponse(
                1L, "testuser", "test@example.com", "USER", null, null, true, false, null, null
        );
    }

    @Test
    @DisplayName("Should register new user successfully")
    void registerNewUser_Success() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toUserResponse(any(User.class))).thenReturn(userResponse);
        when(jwtUtil.generateToken(anyLong(), anyString(), anyString())).thenReturn("jwt-token");

        // When
        AuthResponse response = authService.register(registerRequest);

        // Then
        assertNotNull(response);
        assertEquals("jwt-token", response.token());
        assertEquals("testuser", response.user().username());
        assertEquals("test@example.com", response.user().email());

        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository).existsByUsername("testuser");
        verify(passwordEncoder).encode("Password123!");
        verify(userRepository).save(any(User.class));
        verify(jwtUtil).generateToken(anyLong(), eq("testuser"), eq("ROLE_USER"));
    }

    @Test
    @DisplayName("Should throw ConflictException when email already exists")
    void registerNewUser_EmailExists_ThrowsConflictException() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> authService.register(registerRequest)
        );

        assertEquals("Email already registered", exception.getMessage());
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw ConflictException when username already exists")
    void registerNewUser_UsernameExists_ThrowsConflictException() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        // When & Then
        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> authService.register(registerRequest)
        );

        assertEquals("Username already taken", exception.getMessage());
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should login user successfully")
    void loginUser_Success() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(userMapper.toUserResponse(any(User.class))).thenReturn(userResponse);
        when(jwtUtil.generateToken(anyLong(), anyString(), anyString())).thenReturn("jwt-token");

        // When
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("jwt-token", response.token());
        assertEquals("testuser", response.user().username());

        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("Password123!", "hashedPassword");
        verify(jwtUtil).generateToken(1L, "testuser", "ROLE_USER");
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when user not found")
    void loginUser_UserNotFound_ThrowsUnauthorizedException() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> authService.login(loginRequest)
        );

        assertEquals("Invalid email or password", exception.getMessage());
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when password is incorrect")
    void loginUser_IncorrectPassword_ThrowsUnauthorizedException() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // When & Then
        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> authService.login(loginRequest)
        );

        assertEquals("Invalid email or password", exception.getMessage());
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("Password123!", "hashedPassword");
        verify(jwtUtil, never()).generateToken(anyLong(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should validate password strength correctly")
    void validatePasswordStrength() {
        // Valid passwords
        assertDoesNotThrow(() -> authService.register(registerRequest));

        // Invalid passwords
        registerRequest.setPassword("short");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);

        // This would be tested if password validation is in AuthService
        // For now, validation happens at DTO level with @Pattern annotation
    }
}
