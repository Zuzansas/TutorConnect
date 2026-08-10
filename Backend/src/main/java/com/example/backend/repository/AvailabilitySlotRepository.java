package com.example.backend.repository;

import com.example.backend.model.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, UUID> {

        @Query("SELECT s FROM AvailabilitySlot s WHERE s.startTime >= :from AND s.endTime <= :to")
        List<AvailabilitySlot> findAllByStartTimeBetween(@Param("from") Instant from, @Param("to") Instant to);

        @Query("SELECT s FROM AvailabilitySlot s WHERE s.isReserved = false AND s.startTime >= :from AND s.endTime <= :to")
        List<AvailabilitySlot> findFreeSlots(@Param("from") Instant from, @Param("to") Instant to);

        @Query("SELECT s FROM AvailabilitySlot s WHERE s.isReserved = false " +
                        "AND s.startTime >= :from AND s.endTime <= :to " +
                        "AND s.level = :level AND s.lessonType = :lessonType")
        List<AvailabilitySlot> findMatchingFreeSlots(
                        @Param("from") Instant from,
                        @Param("to") Instant to,
                        @Param("level") String level,
                        @Param("lessonType") String lessonType);
}