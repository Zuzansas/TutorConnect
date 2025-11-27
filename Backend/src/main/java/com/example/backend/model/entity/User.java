package com.example.backend.model.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false, length = 9)
    private String phoneNumber;

    @Column(nullable = false)
    private String password;

    private String avatarURL;

    @Column(length = 100)
    private String city;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Builder.Default
    private Boolean validatedEmail = false;

    @Builder.Default
    private Boolean admin = false;

    private Instant createdAt;

    @Builder.Default
    private Boolean active = true;

    private Instant lastActiveAt;

    @PrePersist
    protected void onCreate() {
        if (lastActiveAt == null) {
            lastActiveAt = Instant.now();
        }
    }

}
