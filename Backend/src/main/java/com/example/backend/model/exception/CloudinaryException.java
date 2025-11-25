package com.example.backend.model.exception;

public class CloudinaryException extends RuntimeException {
    public CloudinaryException(String message) {
        super(message);
    }
}