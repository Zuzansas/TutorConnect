package com.example.backend.model.request;

import java.math.BigDecimal;
import java.util.List;

public record UpdateLessonOfferRequest(
        String title,
        String description,
        String level,
        String lessonType,
        Integer totalLessons,
        BigDecimal price,
        Integer durationMinutes,
        List<String> courseSteps) {
}