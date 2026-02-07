package com.example.backend.model.response;

import com.example.backend.model.enums.ReservationStatus;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
@Getter
public class ReservationResponse {
    private UUID id;
    private String lessonTitle;

    private String studentName;
    private String studentEmail;
    private String studentBio;
    private String studentCity;
    private String studentAvatarUrl;

    private Instant startTime;
    private Instant endTime;
    private BigDecimal price;
    private ReservationStatus status;
    private Instant createdAt;
}