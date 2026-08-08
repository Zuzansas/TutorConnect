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
import com.example.backend.model.request.ForgotPasswordRequest;
import com.example.backend.model.request.LoginRequest;
import com.example.backend.model.request.RefreshRequest;
import com.example.backend.model.request.RegisterRequest;
import com.example.backend.model.request.ResetPasswordRequest;
import com.example.backend.model.response.ErrorResponse;
import com.example.backend.model.response.LoginResponse;
import com.example.backend.model.response.RefreshResponse;
import com.example.backend.model.response.RegisterResponse;
import com.example.backend.service.AuthService;
import com.example.backend.service.RefreshTokenService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

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
        @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<RegisterResponse> register(
                        @RequestPart("request") @Valid RegisterRequest request,
                        @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
                return ResponseEntity.ok(authService.register(request, avatar));
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

        @Operation(summary = "Żądanie zresetowania hasła", description = "Generuje token resetujący i wysyła wiadomość e-mail z linkiem do zmiany hasła.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Link resetujący został wysłany na podany adres e-mail"),
                        @ApiResponse(responseCode = "400", description = "Nieprawidłowy adres e-mail lub błąd walidacji", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PostMapping("/forgot-password")
        public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
                authService.processForgotPassword(request.email());
                return ResponseEntity.ok(Map.of("message", "Link resetujący został wysłany"));
        }

        @Operation(summary = "Resetowanie hasła", description = "Ustawia nowe hasło na podstawie prawidłowego i wygenerowanego wcześniej tokena.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Hasło zostało pomyślnie zmienione"),
                        @ApiResponse(responseCode = "400", description = "Token wygasł, jest nieprawidłowy lub nowe hasło nie spełnia wymagań", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PostMapping("/reset-password")
        public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
                authService.resetPassword(request.token(), request.newPassword());
                return ResponseEntity.ok(Map.of("message", "Hasło zostało zmienione"));
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