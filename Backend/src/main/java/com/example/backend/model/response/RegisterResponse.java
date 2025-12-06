package com.example.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
@Builder
public class RegisterResponse {
    private String accessToken;
    private String refreshToken;
}
