package com.example.backend.controller;

import com.example.backend.model.entity.Reservation;
import com.example.backend.model.entity.User;
import com.example.backend.model.enums.ReservationStatus;
import com.example.backend.model.request.CreateReservationRequest;
import com.example.backend.model.response.ErrorResponse;
import com.example.backend.model.response.LessonMaterialResponse;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.example.backend.service.LessonMaterialService;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Reservation", description = "API do zarządzania rezerwacjami")
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
        private final LessonMaterialService lessonMaterialService;
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

        @Operation(summary = "Dodaj materiały do lekcji (Tylko Tutor/Admin)", description = "Pozwala wgrać plik z materiałami do zakończonej rezerwacji.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Materiał dodany", content = @Content(schema = @Schema(implementation = LessonMaterialResponse.class))),
                        @ApiResponse(responseCode = "403", description = "Brak uprawnień"),
                        @ApiResponse(responseCode = "400", description = "Błąd pliku")
        })
        @PostMapping(value = "/{id}/materials", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<LessonMaterialResponse> addMaterial(
                        @PathVariable UUID id,
                        @RequestPart("file") MultipartFile file,
                        @RequestParam("title") String title,
                        @RequestParam(value = "description", required = false) String description,
                        Principal principal) {

                LessonMaterialResponse response = lessonMaterialService.addMaterial(id, principal.getName(), file,
                                title, description);
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Pobierz materiały do lekcji", description = "Zwraca listę materiałów dla danej rezerwacji. Dostępne dla ucznia (uczestnika) i tutora.")
        @GetMapping("/{id}/materials")
        public ResponseEntity<List<LessonMaterialResponse>> getMaterials(
                        @PathVariable UUID id,
                        Principal principal) {

                List<LessonMaterialResponse> response = lessonMaterialService.getMaterialsForReservation(id,
                                principal.getName());
                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Pobierz rezerwacje", description = "Pobiera listę rezerwacji. Jeśli jesteś Adminem - widzisz wszystkie. Jeśli Studentem - widzisz tylko swoje.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Lista pobrana pomyślnie", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReservationResponse.class)))
        })
        @GetMapping
        public ResponseEntity<List<ReservationResponse>> getReservations(
                        Principal principal) {

                List<Reservation> reservations = reservationService.getReservations(principal.getName());

                List<ReservationResponse> response = reservations.stream()
                                .map(this::toResponse)
                                .toList();

                return ResponseEntity.ok(response);
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