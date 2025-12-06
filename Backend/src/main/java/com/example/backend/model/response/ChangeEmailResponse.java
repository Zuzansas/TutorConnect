package com.example.backend.model.response;

import lombok.Builder;

@Builder
public record ChangeEmailResponse(
                String newEmail,

                String message,

                Boolean verifiedEmail) {
}
