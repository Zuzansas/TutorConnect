package com.example.backend.model.entity;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
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

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "lesson_id", insertable = false, updatable = false)
    @ToString.Exclude
    private List<Review> reviews;

    @ElementCollection
    @CollectionTable(name = "lesson_offer_steps", joinColumns = @JoinColumn(name = "offer_id"))
    @Column(name = "step")
    private List<String> courseSteps;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "views_count", nullable = false)
    @Builder.Default
    private Integer viewsCount = 0;

}