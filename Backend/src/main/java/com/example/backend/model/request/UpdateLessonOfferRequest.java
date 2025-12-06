package com.example.backend.model.request;


import java.math.BigDecimal;


public record UpdateLessonOfferRequest(
        String title,
        String description,
        String level,
        BigDecimal price,
        Integer durationMinutes
) {
}
