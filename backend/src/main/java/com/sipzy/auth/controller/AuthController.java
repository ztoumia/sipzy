package com.sipzy.auth.controller;

import com.sipzy.auth.dto.request.LoginRequest;
import com.sipzy.auth.dto.request.RegisterRequest;
import com.sipzy.auth.dto.response.AuthResponse;
import com.sipzy.auth.service.AuthService;
import com.sipzy.common.dto.ApiResponse;
import com.sipzy.common.util.JwtUtil;
import com.sipzy.user.dto.response.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller pour l'authentification
 * Architecture hexagonale: Point d'entrée API (Adapter)
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints d'authentification")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Inscription utilisateur", description = "Créer un nouveau compte utilisateur")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request for email: {}", request.getEmail());

        AuthResponse response = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PostMapping("/login")
    @Operation(summary = "Connexion", description = "Se connecter avec email et mot de passe")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Déconnexion", description = "Se déconnecter (invalider le token)")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authHeader) {
        log.info("Logout request");

        String token = JwtUtil.extractTokenFromHeader(authHeader);
        authService.logout(token);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-token")
    @Operation(summary = "Vérifier token", description = "Vérifier la validité d'un token")
    public ResponseEntity<ApiResponse<UserResponse>> verifyToken(@RequestHeader("Authorization") String authHeader) {
        log.info("Verify token request");

        String token = JwtUtil.extractTokenFromHeader(authHeader);
        UserResponse user = authService.verifyToken(token);

        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Mot de passe oublié", description = "Demander un reset de mot de passe")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestParam String email) {
        log.info("Forgot password request for email: {}", email);

        authService.forgotPassword(email);

        return ResponseEntity.ok(
                ApiResponse.success(null, "Si l'email existe, un lien de réinitialisation a été envoyé")
        );
    }
}
