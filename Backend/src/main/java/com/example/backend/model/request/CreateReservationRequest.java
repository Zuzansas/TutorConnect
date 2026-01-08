package com.example.backend.model.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateReservationRequest(
        @NotNull(message = "ID oferty jest wymagane") UUID offerId,

        @NotNull(message = "ID terminu (slotu) jest wymagane") UUID slotId) {
}