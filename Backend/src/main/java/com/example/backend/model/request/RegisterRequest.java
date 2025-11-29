package com.example.backend.model.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
                @NotBlank(message = "Imie i nazwisko nie może być puste") String fullName,

                @NotBlank(message = "Adres e-mail nie może być pusty") @Email(message = "Nieprawidłowy format adresu e-mail") String email,

                @NotBlank(message = "Hasło nie może być puste") @Size(min = 8, message = "Hasło musi mieć co najmniej 8 znaków") String password,

                @NotBlank(message = "Hasło nie może być puste") @Size(min = 8, message = "Hasło musi mieć co najmniej 8 znaków") String repeatedPassword) {
}
