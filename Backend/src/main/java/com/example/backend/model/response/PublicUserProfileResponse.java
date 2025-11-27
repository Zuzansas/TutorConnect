package com.example.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicUserProfileResponse {
    private UUID id;
    private String phoneNumber;
    private String email;
    private String fullName;
    private String avatarUrl;

    private String city;

    private Instant lastActiveAt;
    private Boolean verifiedEmail;
}
