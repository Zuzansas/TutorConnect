package com.example.backend.model.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Adres e-mail jest wymagany") @Email(message = "Niepoprawny format adresu e-mail") String email) {
}