package com.example.backend.model.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class UserPackageResponse {
    private UUID id;
    private Integer remainingLessons;
    private Instant purchasedAt;
    private Instant expiresAt;
    private LessonOfferResponse lessonOffer;
}