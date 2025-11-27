package com.example.backend.model.request;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record CreateLessonOfferRequest(
        @NotBlank(message = "Tytuł jest wymagany") @Size(min = 3, max = 100, message = "Tytuł musi mieć od 3 do 100 znaków") String title,

        @NotBlank(message = "Opis jest wymagany") @Size(min = 10, max = 1000, message = "Opis musi mieć od 10 do 1000 znaków") String description,

        @NotBlank(message = "Poziom jest wymagany") String level,
        @NotNull(message = "Cena jest wymagana") BigDecimal price,
        @NotNull(message = "Czas jest wymagany") Integer durationMinutes,

        @Size(max = 5, message = "Maksymalnie 5 zdjęć") List<MultipartFile> images

) {
}
