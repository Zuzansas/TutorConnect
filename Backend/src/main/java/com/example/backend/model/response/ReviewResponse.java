package com.example.backend.model.response;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        Long id,
        UUID reviewerId,
        String authorName,
        String message,
        Integer rating,
        Instant createdAt) {
}