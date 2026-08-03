package com.example.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "user_packages")
public class UserPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private LessonOffer lessonOffer;

    @Column(nullable = false)
    private Integer remainingLessons;

    @Column(nullable = false)
    private Instant purchasedAt;

    private Instant expiresAt;

    @PrePersist
    protected void onCreate() {
        this.purchasedAt = Instant.now();
    }
}