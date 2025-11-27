package com.example.backend.controller;

import com.example.backend.model.request.CreateLessonOfferRequest;
import com.example.backend.model.request.UpdateLessonOfferRequest;
import com.example.backend.model.response.LessonOfferResponse;
import com.example.backend.model.response.ErrorResponse;
import com.example.backend.service.LessonOfferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/lesson-offers")
@RequiredArgsConstructor
public class LessonOfferController {

    private final LessonOfferService service;

    @Operation(summary = "Utwórz nową ofertę lekcji", description = "Tworzy nową ofertę lekcji na podstawie przesłanych danych.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Oferta lekcji została pomyślnie utworzona", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LessonOfferResponse.class))),
            @ApiResponse(responseCode = "400", description = "Niepoprawne dane wejściowe", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    public LessonOfferResponse createOffer(
            @Valid @RequestBody CreateLessonOfferRequest request) {
        return service.createOffer(request);
    }

    @Operation(summary = "Aktualizuj ofertę lekcji", description = "Aktualizuje istniejącą ofertę lekcji o podanym ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Oferta lekcji została pomyślnie zaktualizowana", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LessonOfferResponse.class))),
            @ApiResponse(responseCode = "400", description = "Niepoprawne dane wejściowe", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Oferta lekcji o podanym ID nie istnieje", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}")
    public LessonOfferResponse updateOffer(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLessonOfferRequest request) {
        return service.updateOffer(id, request);
    }

    @Operation(summary = "Usuń ofertę lekcji", description = "Usuwa ofertę lekcji o podanym ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Oferta lekcji została pomyślnie usunięta"),
            @ApiResponse(responseCode = "404", description = "Oferta lekcji o podanym ID nie istnieje", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    public void deleteOffer(@PathVariable UUID id) {
        service.deleteOffer(id);
    }

    @Operation(summary = "Pobierz ofertę lekcji", description = "Zwraca szczegóły oferty lekcji o podanym ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Oferta lekcji została pomyślnie pobrana", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LessonOfferResponse.class))),
            @ApiResponse(responseCode = "404", description = "Oferta lekcji o podanym ID nie istnieje", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public LessonOfferResponse getOffer(@PathVariable UUID id) {
        return service.getOffer(id);
    }
}
