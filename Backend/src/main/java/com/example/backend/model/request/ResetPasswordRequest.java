package com.example.backend.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Token jest wymagany") String token,

        @NotBlank(message = "Nowe hasło jest wymagane") @Size(min = 6, message = "Hasło musi mieć co najmniej 6 znaków") String newPassword) {
}