package com.example.backend.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import jakarta.validation.constraints.Size;

import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public record UpdateLessonOfferRequest(
        @NotBlank(message = "Tytuł jest wymagany") @Size(min = 3, max = 100) String title,

        @NotBlank(message = "Opis jest wymagany") @Size(min = 10) String description,

        @NotBlank(message = "Poziom jest wymagany") String level,

        @NotNull(message = "Cena jest wymagana") BigDecimal price,

        @NotNull(message = "Czas trwania jest wymagany") Integer durationMinutes

) {
}
