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
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;

import java.math.BigDecimal;
import java.util.List;

import java.util.UUID;

@Tag(name = "Lesson offer", description = "API do zarządzania ofertami lekcji")
@RestController
@RequestMapping("/api/lesson-offers")
@RequiredArgsConstructor
public class LessonOfferController {

    private final LessonOfferService service;

    @Operation(summary = "Pobierz WSZYSTKIE oferty lekcji", description = "Zwraca pełną listę ofert bez paginacji.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista ofert została pobrana", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LessonOfferResponse.class)))
    })
    @GetMapping("/all")
    public List<LessonOfferResponse> getAllOffers() {
        return service.getAllOffers();
    }

    @Operation(summary = "Utwórz nową ofertę lekcji", description = "Tworzy nową ofertę lekcji na podstawie przesłanych danych.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Oferta lekcji została pomyślnie utworzona", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LessonOfferResponse.class))),
            @ApiResponse(responseCode = "400", description = "Niepoprawne dane wejściowe", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public LessonOfferResponse createOffer(
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam BigDecimal price,
            @RequestParam String level,
            @RequestParam String lessonType,
            @RequestParam Integer totalLessons,
            @RequestParam Integer duration,
            @RequestParam List<String> steps) {
        CreateLessonOfferRequest request = new CreateLessonOfferRequest(
                title, description, level, lessonType, totalLessons, price, duration, steps);
        return service.createOffer(request, image);
    }

    @Operation(summary = "Aktualizuj ofertę lekcji", description = "Aktualizuje istniejącą ofertę lekcji wraz ze zdjęciem.")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public LessonOfferResponse updateOffer(
            @PathVariable UUID id,
            @Valid @ModelAttribute UpdateLessonOfferRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return service.updateOffer(id, request, image);
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
