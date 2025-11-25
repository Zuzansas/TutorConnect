package com.example.backend.model.request;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 100, message = "Imie i nazwisko musi zawierać od 2 do 100 znaków") String fullName,

        @Size(max = 500, message = "Bio nie może przekraczać 500 znaków") String bio) {
}
