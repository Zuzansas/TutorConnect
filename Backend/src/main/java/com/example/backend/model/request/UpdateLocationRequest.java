package com.example.backend.model.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateLocationRequest(
        @NotNull(message = "Szerokość geograficzna jest wymagana") @DecimalMin(value = "-90.0", message = "Szerokość geograficzna musi mieścić się w przedziale od -90 do 90") @DecimalMax(value = "90.0", message = "Szerokość geograficzna musi mieścić się w przedziale od -90 do 90") BigDecimal latitude,

        @NotNull(message = "Długość geograficzna jest wymagana") @DecimalMin(value = "-180.0", message = "Długość geograficzna musi mieścić się w przedziale od -180 do 180") @DecimalMax(value = "180.0", message = "Długość geograficzna musi mieścić się w przedziale od -180 do 180") BigDecimal longitude,

        String city) {
}
