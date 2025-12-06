package com.example.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@AllArgsConstructor
@Getter
@Setter
@Builder
public class MeResponse {
    private UUID id;
    private String email;
    private String fullName;

    private String avatarUrl;
    private String bio;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private String city;

    private BigDecimal rating;
    private Integer totalExchanges;

    private Boolean verifiedEmail;
}
