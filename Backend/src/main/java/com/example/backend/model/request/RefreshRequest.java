package com.example.backend.model.request;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
                @NotBlank(message = "RefreshToken nie może być pusty") String refreshToken) {
}
