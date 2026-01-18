package com.example.backend.model.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record AvailabilitySlotRequest(
                @Schema(description = "Data rozpoczęcia slotu (musi być wcześniejsza niż data zakończenia)", example = "2024-05-20T10:00:00Z") @NotNull(message = "Data rozpoczęcia jest wymagana") Instant startTime,

                @Schema(description = "Data zakończenia slotu", example = "2024-05-20T11:00:00Z") @NotNull(message = "Data zakończenia jest wymagana") Instant endTime) {

        @AssertTrue(message = "Data zakończenia musi być późniejsza niż data rozpoczęcia")
        @Schema(hidden = true)
        public boolean isTimeValid() {
                if (startTime == null || endTime == null) {
                        return true;
                }
                return endTime.isAfter(startTime);
        }
}