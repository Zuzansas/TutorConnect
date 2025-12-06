package com.example.backend.model.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ChangeEmailRequest(
                @NotBlank(message = "Nowy adres e-mail jest wymagany") @Email(message = "Nieprawidłowy format adresu e-mail") String newEmail,

                @NotBlank(message = "Potwierdzenie adresu e-mail jest wymagane") @Email(message = "Nieprawidłowy format adresu e-mail") String confirmNewEmail,

                @NotBlank(message = "Hasło jest wymagane do zmiany e-maila") String password) {
}
