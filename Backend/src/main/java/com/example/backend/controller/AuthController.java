package com.example.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.example.backend.model.dto.TokenPair;
import com.example.backend.model.request.LoginRequest;
import com.example.backend.model.request.RefreshRequest;
import com.example.backend.model.request.RegisterRequest;
import com.example.backend.model.response.ErrorResponse;
import com.example.backend.model.response.LoginResponse;
import com.example.backend.model.response.RefreshResponse;
import com.example.backend.model.response.RegisterResponse;
import com.example.backend.service.AuthService;
import com.example.backend.service.RefreshTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "API do uwierzytelniania i autoryzacji użytkowników")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
        private final AuthService authService;
        private final RefreshTokenService refreshTokenService;

        @Operation(summary = "Rejestracja nowego użytkownika", description = "Tworzy nowe konto użytkownika w systemie.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Użytkownik został pomyślnie zarejestrowany", content = @Content(mediaType = "application/json", schema = @Schema(implementation = RegisterResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Błąd walidacji lub email/username już istnieje", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PostMapping("/register")
        public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
                return ResponseEntity.ok(authService.register(request));
        }

        @Operation(summary = "Logowanie użytkownika", description = "Uwierzytelnia użytkownika i zwraca tokeny dostępu (access token i refresh token)")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Użytkownik został pomyślnie zalogowany", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Nieprawidłowe dane logowania", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PostMapping("/login")
        public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
                return ResponseEntity.ok(authService.login(request));
        }

        @Operation(summary = "Odświeżenie tokenu dostępu", description = "Generuje nową parę tokenów na podstawie ważnego refresh tokenu")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Tokeny zostały pomyślnie odświeżone", content = @Content(mediaType = "application/json", schema = @Schema(implementation = RefreshResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Nieprawidłowy lub wygasły refresh token", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PostMapping("/token/refresh")
        public ResponseEntity<RefreshResponse> refreshToken(@Valid @RequestBody RefreshRequest request) {
                TokenPair tokens = refreshTokenService.refreshAuthTokens(request.refreshToken());
                return ResponseEntity.ok(
                                new RefreshResponse(tokens.getAccessToken(), tokens.getRefreshToken()));
        }

        @Operation(summary = "Health check", description = "Sprawdza czy serwis autoryzacji działa poprawnie")
        @GetMapping("/health")
        public ResponseEntity<Boolean> health() {
                return ResponseEntity.ok(true);
        }
}
