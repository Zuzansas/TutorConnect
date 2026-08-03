package com.example.backend.controller;

import com.example.backend.model.request.AvailabilitySlotRequest;
import com.example.backend.model.response.AvailabilitySlotResponse;
import com.example.backend.service.AvailabilitySlotService;
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
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Tag(name = "Availability Slots", description = "Zarządzanie dostępnością w kalendarzu")
@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class AvailabilitySlotController {

    private final AvailabilitySlotService slotService;
    private final UserService userService;

    @Operation(summary = "Dodaj nowy termin (Admin)", description = "Tworzy nowe okienko czasowe, w którym korepetytor jest dostępny.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utworzono slot", content = @Content(schema = @Schema(implementation = AvailabilitySlotResponse.class))),
            @ApiResponse(responseCode = "403", description = "Brak uprawnień administratora")
    })
    @PostMapping
    public AvailabilitySlotResponse createSlot(
            @Valid @RequestBody AvailabilitySlotRequest request,
            Principal principal) {

        userService.validateAdminAccess(principal.getName());

        return slotService.createSlot(request);
    }

    @Operation(summary = "Pobierz wolne terminy (Ogólne)", description = "Zwraca listę wszystkich dostępnych slotów w podanym zakresie dat.")
    @GetMapping("/available")
    public List<AvailabilitySlotResponse> getAvailableSlots(
            @RequestParam Instant from,
            @RequestParam Instant to) {

        return slotService.getFreeSlots(from, to);
    }

    @Operation(summary = "Pobierz wolne terminy dla pakietu", description = "Zwraca wolne terminy przefiltrowane wg poziomu trudności i typu zajęć wykupionego pakietu.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista dopasowanych slotów", content = @Content(schema = @Schema(implementation = AvailabilitySlotResponse.class))),
            @ApiResponse(responseCode = "404", description = "Nie znaleziono pakietu")
    })
    @GetMapping("/available-for-package")
    public List<AvailabilitySlotResponse> getAvailableSlotsForPackage(
            @RequestParam UUID userPackageId,
            @RequestParam Instant from,
            @RequestParam Instant to) {

        return slotService.getMatchingFreeSlotsForPackage(userPackageId, from, to);
    }

    @Operation(summary = "Usuń termin (Admin)", description = "Usuwa niezarezerwowany termin z kalendarza.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlot(
            @PathVariable UUID id,
            Principal principal) {

        userService.validateAdminAccess(principal.getName());

        slotService.deleteSlot(id);
        return ResponseEntity.noContent().build();
    }
}