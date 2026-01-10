package com.example.backend.model.response;

import lombok.Builder;
import lombok.Getter;
import java.time.Instant;
import java.util.UUID;

@Builder
@Getter
public class AvailabilitySlotResponse {
    private UUID id;
    private Instant startTime;
    private Instant endTime;
    private boolean isReserved;
}