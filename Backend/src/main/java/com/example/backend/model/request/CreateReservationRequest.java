package com.example.backend.model.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateReservationRequest(
                @Schema(description = "ID wykupionego pakietu użytkownika", example = "123e4567-e89b-12d3-a456-426614174000") @NotNull(message = "ID pakietu jest wymagane") UUID userPackageId,

                @Schema(description = "ID terminu z kalendarza", example = "987e6543-e89b-12d3-a456-426614174000") @NotNull(message = "ID terminu (slotu) jest wymagane") UUID slotId) {
}