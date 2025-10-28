package com.sipzy.auth.service;

import com.sipzy.auth.dto.request.LoginRequest;
import com.sipzy.auth.dto.request.RegisterRequest;
import com.sipzy.auth.dto.response.AuthResponse;
import com.sipzy.common.exception.BadRequestException;
import com.sipzy.common.exception.ConflictException;
import com.sipzy.common.exception.UnauthorizedException;
import com.sipzy.common.util.JwtUtil;
import com.sipzy.user.domain.User;
import com.sipzy.user.dto.response.UserResponse;
import com.sipzy.user.mapper.UserMapper;
import com.sipzy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Authentication Service
 * Handles user registration, login, logout, token verification
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    /**
     * Register a new user
     */
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already taken");
        }

        // Create user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.USER)
                .isVerified(false)
                .verificationToken(UUID.randomUUID().toString())
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getId());

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        return new AuthResponse(userMapper.toUserResponse(user), token);
    }

    /**
     * Login user
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        log.info("User logged in successfully: {}", user.getId());

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        return new AuthResponse(userMapper.toUserResponse(user), token);
    }

    /**
     * Logout user (client-side token invalidation)
     */
    public void logout(String token) {
        // For stateless JWT, logout is handled client-side by removing the token
        // Could implement token blacklist here if needed
        log.info("User logout");
    }

    /**
     * Verify JWT token
     */
    @Transactional(readOnly = true)
    public UserResponse verifyToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new UnauthorizedException("Invalid or expired token");
        }

        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return userMapper.toUserResponse(user);
    }

    /**
     * Send password reset email
     */
    public void forgotPassword(String email) {
        log.info("Password reset requested for: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email not found"));

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        // Set expiration to 1 hour from now
        user.setPasswordResetTokenExpiresAt(java.time.Instant.now().plusSeconds(3600));

        userRepository.save(user);

        // TODO: Send email with reset link
        log.info("Password reset token generated for user: {}", user.getId());
        // In production, send email: emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    /**
     * Reset password with token
     */
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        // Check if token is expired
        if (user.getPasswordResetTokenExpiresAt().isBefore(java.time.Instant.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);

        userRepository.save(user);
        log.info("Password reset successfully for user: {}", user.getId());
    }

}
