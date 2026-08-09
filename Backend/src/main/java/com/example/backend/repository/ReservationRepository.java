package com.example.backend.repository;

import com.example.backend.model.entity.Reservation;
import com.example.backend.model.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

        long countByAvailabilitySlotIdAndStatusNot(UUID slotId, ReservationStatus status);

        @Query("SELECT r FROM Reservation r WHERE r.status = :status AND r.startTime <= :threshold")
        List<Reservation> findUnpaidUpcoming(@Param("status") ReservationStatus status,
                        @Param("threshold") Instant threshold);

        List<Reservation> findAllByStudentIdOrderByStartTimeDesc(UUID studentId);

        List<Reservation> findAllByOrderByStartTimeDesc();

        @Query("SELECT COUNT(r) > 0 FROM Reservation r " +
                        "WHERE r.student.id = :studentId " +
                        "AND r.userPackage.lessonOffer.id = :lessonOfferId " +
                        "AND r.status = :status")
        boolean existsByStudentIdAndLessonOfferIdAndStatus(
                        @Param("studentId") UUID studentId,
                        @Param("lessonOfferId") UUID lessonOfferId,
                        @Param("status") ReservationStatus status);
}
