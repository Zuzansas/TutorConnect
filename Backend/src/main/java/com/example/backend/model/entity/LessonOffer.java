package com.example.backend.model.entity;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@Table(name = "LessonOffer")
public class LessonOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    private String level;

    private BigDecimal price;

    private Integer durationMinutes;

    @OneToMany
    @ToString.Exclude
    private List<Review> reviews;

    @Column(name = "views_count", nullable = false)
    @Builder.Default
    private Integer viewsCount = 0;

}