package com.example.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
}
