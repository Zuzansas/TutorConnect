package com.example.backend.controller;

import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.example.backend.model.request.UpdateLocationRequest;
import com.example.backend.model.request.UpdateProfileRequest;
import com.example.backend.model.request.ChangePasswordRequest;
import com.example.backend.model.request.ChangeEmailRequest;
import com.example.backend.model.response.*;
import com.example.backend.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Tag(name = "User", description = "API do zarządzania profilami użytkowników")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
        private final UserService userService;

        @Operation(summary = "Pobierz mój profil", description = "Zwraca pełne dane profilu zalogowanego użytkownika")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Profil został pomyślnie pobrany", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MeResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Brak autoryzacji", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @GetMapping("/me")
        public ResponseEntity<MeResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
                MeResponse response = userService.getCurrentUserProfile(userDetails.getUsername());
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Zaktualizuj mój profil", description = "Aktualizuje dane profilu zalogowanego użytkownika")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Profil został pomyślnie zaktualizowany", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MeResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Błąd walidacji danych", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Brak autoryzacji", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PutMapping("/me")
        public ResponseEntity<MeResponse> updateProfile(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @Valid @RequestBody UpdateProfileRequest request) {
                MeResponse response = userService.updateProfile(userDetails.getUsername(), request);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Zaktualizuj avatar", description = "Przesyła nowy avatar użytkownika (zdjęcie profilowe)")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Avatar został pomyślnie zaktualizowany", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AvatarUploadResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Nieprawidłowy format pliku lub plik jest za duży", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Brak autoryzacji", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PutMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<AvatarUploadResponse> uploadAvatar(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestParam("file") MultipartFile file) {
                AvatarUploadResponse response = userService.uploadAvatar(userDetails.getUsername(), file);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Zaktualizuj lokalizację", description = "Aktualizuje lokalizację użytkownika. Automatycznie wykrywa nazwę miasta z współrzędnych GPS.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Lokalizacja została pomyślnie zaktualizowana", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LocationUpdateResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Błąd walidacji danych lokalizacji", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Brak autoryzacji", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PutMapping("/me/location")
        public ResponseEntity<LocationUpdateResponse> updateLocation(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @Valid @RequestBody UpdateLocationRequest request) {
                LocationUpdateResponse response = userService.updateLocation(userDetails.getUsername(), request);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Zmień hasło", description = "Zmienia hasło zalogowanego użytkownika. Wymaga podania aktualnego hasła oraz nowego hasła z potwierdzeniem.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Hasło zostało pomyślnie zmienione", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChangePasswordResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Błąd walidacji danych lub hasła nie są zgodne", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Brak autoryzacji lub nieprawidłowe aktualne hasło", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PutMapping("/me/password")
        public ResponseEntity<ChangePasswordResponse> changePassword(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @Valid @RequestBody ChangePasswordRequest request) {
                ChangePasswordResponse response = userService.changePassword(userDetails.getUsername(), request);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Zmień adres e-mail", description = "Zmienia adres e-mail zalogowanego użytkownika. Wymaga podania hasła oraz potwierdzenia nowego adresu. Po zmianie konieczna będzie ponowna weryfikacja e-maila.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Adres e-mail został pomyślnie zmieniony", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChangeEmailResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Błąd walidacji danych, adresy e-mail nie są zgodne lub e-mail jest już zajęty", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Brak autoryzacji lub nieprawidłowe hasło", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PutMapping("/me/email")
        public ResponseEntity<ChangeEmailResponse> changeEmail(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @Valid @RequestBody ChangeEmailRequest request) {
                ChangeEmailResponse response = userService.changeEmail(userDetails.getUsername(), request);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Pobierz publiczny profil użytkownika", description = "Zwraca publiczne dane profilu wybranego użytkownika (bez danych wrażliwych)")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Profil użytkownika został pomyślnie pobrany", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PublicUserProfileResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Użytkownik o podanym ID nie istnieje", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @GetMapping("/{userId}")
        public ResponseEntity<PublicUserProfileResponse> getUserProfile(@PathVariable UUID userId) {
                PublicUserProfileResponse response = userService.getPublicUserProfile(userId);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Deaktywacja konta użytkownika", description = "Deaktywuje konto użytkownika")
        @PostMapping("/me/deactivate")
        public ResponseEntity<String> deactivateUser(@AuthenticationPrincipal UserDetails userDetails) {
                userService.deactivateUser(userDetails.getUsername());
                return ResponseEntity.ok("Konto zostało zdeaktywowane");
        }
}