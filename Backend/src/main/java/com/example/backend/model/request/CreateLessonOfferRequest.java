package com.example.backend.model.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

import java.math.BigDecimal;

public record CreateLessonOfferRequest(
        @NotBlank(message = "Tytuł jest wymagany") @Size(min = 3, max = 100) String title,
        @NotBlank(message = "Opis jest wymagany") @Size(min = 10) String description,
        @NotBlank(message = "Poziom jest wymagany") String level,
        @NotBlank(message = "Typ lekcji jest wymagany (INDIVIDUAL/GROUP)") String lessonType,
        @NotNull(message = "Liczba lekcji w pakiecie jest wymagana") Integer totalLessons,
        @NotNull(message = "Cena jest wymagana") BigDecimal price,
        @NotNull(message = "Czas trwania jest wymagany") Integer durationMinutes,
        @NotNull(message = "Kroki kursu są wymagane") List<String> courseSteps) {
}
