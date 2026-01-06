package com.example.backend.model.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ReviewRequest(
        @NotNull(message = "ID lekcji jest wymagane") UUID reviewedLessonId,

        @NotBlank(message = "Treść opinii nie może być pusta") String message,

        @NotNull(message = "Ocena jest wymagana") @Min(value = 1, message = "Ocena musi być co najmniej 1") @Max(value = 5, message = "Ocena może wynosić maksymalnie 5") Integer rating) {
}