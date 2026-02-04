package com.example.backend.model.response;

import java.util.List;
import java.math.BigDecimal;
import java.util.UUID;

public record LessonOfferResponse(
                UUID id,
                String title,
                String description,
                String level,
                BigDecimal price,
                Integer durationMinutes,
                Integer viewsCount,
                List<String> courseSteps,
                String imageUrl) {
}
