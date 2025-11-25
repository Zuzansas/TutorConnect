package com.example.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationUpdateResponse {
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String city;
}
