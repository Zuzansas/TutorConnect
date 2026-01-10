package com.example.backend.service;

import com.example.backend.model.entity.*;
import com.example.backend.model.enums.ReservationStatus;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AvailabilitySlotRepository slotRepository;
    private final LessonOfferRepository offerRepository;
    private final UserRepository userRepository;

    private static final long CANCELLATION_DEADLINE_HOURS = 48;

    @Transactional
    public Reservation createReservation(UUID offerId, UUID studentId, UUID slotId) {
        LessonOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Oferta nie istnieje"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Uczeń nie istnieje"));

        AvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Termin nie istnieje"));

        if (slot.isReserved()) {
            throw new RuntimeException("Ten termin został już zarezerwowany przez kogoś innego.");
        }

        slot.setReserved(true);
        slotRepository.save(slot);

        Reservation reservation = Reservation.builder()
                .student(student)
                .lessonOffer(offer)
                .availabilitySlot(slot)
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .price(offer.getPrice())
                .status(ReservationStatus.PENDING_PAYMENT)
                .build();

        return reservationRepository.save(reservation);
    }

    @Transactional
    public void cancelReservationLogic(Reservation reservation) {
        reservation.setStatus(ReservationStatus.CANCELLED);
        AvailabilitySlot slot = reservation.getAvailabilitySlot();
        if (slot != null) {
            slot.setReserved(false);
            slotRepository.save(slot);
        }

        reservationRepository.save(reservation);
    }

    @Transactional
    public void cancelByTutor(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Rezerwacja nie istnieje"));

        cancelReservationLogic(reservation);
    }

    @Transactional
    public String cancelByStudent(UUID reservationId, UUID studentId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Rezerwacja nie istnieje"));

        if (!reservation.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Brak dostępu");
        }

        Instant now = Instant.now();
        Instant deadline = reservation.getStartTime().minus(Duration.ofHours(CANCELLATION_DEADLINE_HOURS));

        cancelReservationLogic(reservation);

        if (now.isBefore(deadline)) {
            return "Anulowano. Środki zostaną zwrócone.";
        } else {
            return "Anulowano. Zbyt późno na zwrot kosztów.";
        }
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autoCancelUnpaid() {

        Instant threshold = Instant.now().plus(Duration.ofHours(CANCELLATION_DEADLINE_HOURS));

        var unpaidUrgent = reservationRepository.findUnpaidUpcoming(ReservationStatus.PENDING_PAYMENT, threshold);

        for (Reservation res : unpaidUrgent) {
            cancelReservationLogic(res);
            System.out.println("Automatycznie anulowano nieopłaconą rezerwację ID: " + res.getId());
        }
    }

}