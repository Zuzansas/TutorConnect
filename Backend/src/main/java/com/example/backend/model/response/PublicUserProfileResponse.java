package com.example.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicUserProfileResponse {
    private UUID id;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String city;
    private BigDecimal rating;
    private Integer totalExchanges;
    private Instant lastActiveAt;
    private Boolean verifiedEmail;
}
