package com.example.backend.model.enums;

public enum ReservationStatus {
    PENDING_PAYMENT, // Reserved, awaiting payment
    CONFIRMED, // Paid, appointment confirmed
    CANCELLED, // Cancelled by user or system
    COMPLETED // Classes have taken place
}