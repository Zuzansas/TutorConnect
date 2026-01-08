package com.example.backend.controller;

import com.example.backend.model.entity.Reservation;
import com.example.backend.model.entity.User;
import com.example.backend.model.request.CreateReservationRequest;
import com.example.backend.model.response.ErrorResponse;
import com.example.backend.model.response.ReservationResponse;
import com.example.backend.service.ReservationService;
import com.example.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Reservation", description = "API do zarządzania rezerwacjami")
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

        private final ReservationService reservationService;
        private final UserService userService;

        @Operation(summary = "Utwórz nową rezerwację", description = "Rezerwuje termin dla zalogowanego użytkownika na podstawie wybranej oferty i slotu czasowego.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Rezerwacja została pomyślnie utworzona", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReservationResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Niepoprawne dane wejściowe lub termin zajęty", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Nie znaleziono oferty lub terminu", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PostMapping
        public ReservationResponse createReservation(
                        @Valid @RequestBody CreateReservationRequest request,
                        Principal principal) {

                User student = userService.findUserByUsername(principal.getName());

                Reservation reservation = reservationService.createReservation(
                                request.offerId(),
                                student.getId(),
                                request.slotId());

                return toResponse(reservation);
        }

        @Operation(summary = "Anuluj rezerwację (Uczeń)", description = "Pozwala uczniowi anulować rezerwację. Zwraca komunikat o statusie zwrotu środków (zasada 48h).")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Rezerwacja anulowana", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
                        @ApiResponse(responseCode = "403", description = "Brak uprawnień do anulowania tej rezerwacji", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Rezerwacja nie istnieje", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @PostMapping("/{id}/cancel")
        public ResponseEntity<Map<String, String>> cancelReservation(
                        @PathVariable UUID id,
                        Principal principal) {

                User student = userService.findUserByUsername(principal.getName());

                String message = reservationService.cancelByStudent(id, student.getId());

                return ResponseEntity.ok(Map.of("message", message));
        }

        @Operation(summary = "Anuluj rezerwację (Korepetytor)", description = "Pozwala korepetytorowi odwołać zajęcia w trybie nagłym. Wymaga uprawnień administratora.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Rezerwacja anulowana pomyślnie"),
                        @ApiResponse(responseCode = "403", description = "Brak uprawnień administratora", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Rezerwacja nie istnieje", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> cancelReservationByTutor(
                        @PathVariable UUID id,
                        Principal principal) {
                userService.validateAdminAccess(principal.getName());
                reservationService.cancelByTutor(id);

                return ResponseEntity.noContent().build();
        }

        private ReservationResponse toResponse(Reservation r) {
                return ReservationResponse.builder()
                                .id(r.getId())
                                .lessonTitle(r.getLessonOffer().getTitle())
                                .studentName(r.getStudent().getFullName())
                                .startTime(r.getStartTime())
                                .endTime(r.getEndTime())
                                .price(r.getPrice())
                                .status(r.getStatus())
                                .createdAt(r.getCreatedAt())
                                .build();
        }
}