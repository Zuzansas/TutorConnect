package com.example.backend.model.request;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record AvailabilitySlotRequest(
        @NotNull(message = "Data rozpoczęcia jest wymagana") Instant startTime,

        @NotNull(message = "Data zakończenia jest wymagana") Instant endTime) {
}