package com.example.backend.model.response;

import java.time.Instant;
import java.util.UUID;

public record LessonMaterialResponse(
        UUID id,
        String title,
        String description,
        String fileUrl,
        String fileType,
        Instant createdAt) {
}