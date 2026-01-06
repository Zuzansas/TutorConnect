package com.example.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import com.example.backend.model.entity.Review;
import com.example.backend.model.entity.User;
import com.example.backend.model.request.ReviewRequest;
import com.example.backend.model.response.ErrorResponse;
import com.example.backend.model.response.ReviewResponse;
import com.example.backend.service.ReviewService;
import com.example.backend.service.UserService; // Zakładam istnienie serwisu do pobierania Usera

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Tag(name = "Reviews", description = "API do zarządzania opiniami i ocenami lekcji")
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    @Operation(summary = "Dodaj nową opinię", description = "Pozwala użytkownikowi dodać recenzję do konkretnej oferty lekcji.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Opinia została pomyślnie dodana", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReviewResponse.class))),
            @ApiResponse(responseCode = "400", description = "Błąd walidacji lub użytkownik już ocenił tę lekcję", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Nie znaleziono użytkownika lub lekcji", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewRequest request) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User author = userService.findUserByUsername(userDetails.getUsername());
        if (author == null) {
            throw new RuntimeException("Nie znaleziono użytkownika: " + userDetails.getUsername());
        }

        Review newReview = new Review();
        newReview.setReviewedLessonId(request.reviewedLessonId());
        newReview.setMessage(request.message());
        newReview.setRating(request.rating());

        Review savedReview = reviewService.createReview(newReview, author);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapToResponse(savedReview));
    }

    @Operation(summary = "Usuń opinię", description = "Pozwala autorowi lub administratorowi usunąć opinię.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Opinia została usunięta"),
            @ApiResponse(responseCode = "403", description = "Brak uprawnień do usunięcia opinii", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Opinia nie została znaleziona", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @Parameter(description = "ID opinii do usunięcia", required = true) @PathVariable Long id,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User currentUser = userService.findUserByUsername(userDetails.getUsername());
        if (currentUser == null) {
            throw new RuntimeException("Nie znaleziono użytkownika: " + userDetails.getUsername());
        }
        reviewService.deleteReview(id, currentUser);

        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Pobierz opinie dla lekcji", description = "Zwraca listę wszystkich opinii przypisanych do danej oferty lekcji.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pobrano listę opinii", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReviewResponse.class)))
    })
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByLesson(
            @Parameter(description = "ID oferty lekcji", required = true) @PathVariable UUID lessonId) {

        List<ReviewResponse> responses = reviewService.getAllReviews().stream()
                .filter(r -> r.getReviewedLessonId().equals(lessonId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    private ReviewResponse mapToResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getReviewerId(),
                review.getAuthor(),
                review.getMessage(),
                review.getRating(),
                review.getCreatedAt());
    }
}