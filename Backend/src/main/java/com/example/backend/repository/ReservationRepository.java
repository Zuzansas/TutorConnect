package com.example.backend.repository;

import com.example.backend.model.entity.Reservation;
import com.example.backend.model.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    @Query("SELECT r FROM Reservation r WHERE r.status = :status AND r.startTime <= :threshold")
    List<Reservation> findUnpaidUpcoming(@Param("status") ReservationStatus status,
            @Param("threshold") Instant threshold);

    boolean existsByStudentIdAndLessonOfferIdAndStatus(
            UUID studentId,
            UUID lessonOfferId,
            ReservationStatus status);
}
