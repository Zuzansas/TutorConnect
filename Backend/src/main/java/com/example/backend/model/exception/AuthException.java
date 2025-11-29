package com.example.backend.model.exception;

public class AuthException extends RuntimeException {
    public AuthException(String message) {
        super(message);
    }
}
