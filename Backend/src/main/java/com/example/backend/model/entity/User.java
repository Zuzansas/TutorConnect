package com.example.backend.model.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
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

    @Column(nullable = false)
    private String password;

    private String avatarURL;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(length = 100)
    private String city;

    @Min(0)
    @Max(5)
    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Builder.Default
    private Integer totalExchanges = 0;

    @Builder.Default
    private Boolean validatedEmail = false;

    @Builder.Default
    private Boolean admin = false;

    @Builder.Default
    private Boolean active = true;

    private Instant createdAt;

    private Instant lastActiveAt;

    @PrePersist
    protected void onCreate() {
        if (lastActiveAt == null) {
            lastActiveAt = Instant.now();
        }
    }

    public boolean isAdmin() {
        return Boolean.TRUE.equals(this.admin);
    }
}
