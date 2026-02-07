package com.example.backend.model.request;

import jakarta.validation.constraints.NotNull;

public record UpdateLocationRequest(
                @NotNull(message = "Miasto jest wymagane") String city) {
}
