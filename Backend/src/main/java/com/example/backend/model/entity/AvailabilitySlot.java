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
@Table(name = "availability_slots")
public class AvailabilitySlot {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Instant startTime;

    @Column(nullable = false)
    private Instant endTime;

    @Column(nullable = false)
    private String level;

    @Column(nullable = false)
    private String lessonType;

    @Builder.Default
    private boolean isReserved = false;

    @Column(nullable = false)
    @org.hibernate.annotations.ColumnDefault("1")
    @Builder.Default
    private Integer capacity = 1;

    @Column(length = 500)
    private String description;

    public Integer getCapacity() {
        return capacity != null ? capacity : 1;
    }
}