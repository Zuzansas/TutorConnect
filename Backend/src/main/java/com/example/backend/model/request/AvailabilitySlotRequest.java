package com.example.backend.model.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record AvailabilitySlotRequest(
                @Schema(description = "Data rozpoczęcia slotu", example = "2026-08-01T10:00:00Z") @NotNull(message = "Data rozpoczęcia jest wymagana") Instant startTime,

                @Schema(description = "Data zakończenia slotu", example = "2026-08-01T11:00:00Z") @NotNull(message = "Data zakończenia jest wymagana") Instant endTime,

                @NotBlank(message = "Poziom jest wymagany") String level,
                String description,

                @NotBlank(message = "Typ lekcji jest wymagany (INDIVIDUAL/GROUP)") String lessonType) {
        @AssertTrue(message = "Data zakończenia musi być późniejsza niż data rozpoczęcia")
        @Schema(hidden = true)
        public boolean isTimeValid() {
                if (startTime == null || endTime == null) {
                        return true;
                }
                return endTime.isAfter(startTime);
        }
}