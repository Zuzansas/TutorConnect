package com.example.backend.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
                @NotBlank(message = "Aktualne hasło jest wymagane") String currentPassword,

                @NotBlank(message = "Nowe hasło jest wymagane") @Size(min = 8, message = "Hasło musi mieć co najmniej 8 znaków") String newPassword,

                @NotBlank(message = "Potwierdzenie hasła jest wymagane") @Size(min = 8, message = "Hasło musi mieć co najmniej 8 znaków") String confirmNewPassword) {
}
