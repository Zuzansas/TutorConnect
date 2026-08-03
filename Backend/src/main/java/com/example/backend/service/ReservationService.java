package com.example.backend.service;

import com.example.backend.model.entity.*;
import com.example.backend.model.enums.ReservationStatus;
import com.example.backend.model.exception.BadRequestException;
import com.example.backend.model.exception.NotFoundException;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AvailabilitySlotRepository slotRepository;
    private final UserPackageRepository packageRepository;
    private final UserService userService;

    private static final long BOOKING_LIMIT_HOURS = 24;
    private static final long CANCELLATION_DEADLINE_HOURS = 12;

    @Transactional
    public Reservation createReservation(UUID userPackageId, UUID slotId, String username) {
        User student = userService.findUserByUsername(username);
        UserPackage userPackage = packageRepository.findById(userPackageId)
                .orElseThrow(() -> new NotFoundException("Pakiet nie istnieje"));

        if (!userPackage.getUser().getId().equals(student.getId())) {
            throw new BadRequestException("Pakiet nie należy do tego użytkownika.");
        }

        if (userPackage.getRemainingLessons() <= 0) {
            throw new BadRequestException("Brak dostępnych lekcji w pakiecie.");
        }

        AvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new NotFoundException("Termin nie istnieje"));

        if (slot.isReserved()) {
            throw new BadRequestException("Ten termin jest już zarezerwowany.");
        }

        LessonOffer offer = userPackage.getLessonOffer();

        if (!slot.getLevel().equals(offer.getLevel()) || !slot.getLessonType().equals(offer.getLessonType())) {
            throw new BadRequestException("Termin nie odpowiada profilowi wykupionego pakietu.");
        }

        Instant now = Instant.now();
        if (now.plus(Duration.ofHours(BOOKING_LIMIT_HOURS)).isAfter(slot.getStartTime())) {
            throw new BadRequestException("Rezerwacji można dokonać najpóźniej na 24h przed zajęciami.");
        }

        slot.setReserved(true);
        slotRepository.save(slot);

        userPackage.setRemainingLessons(userPackage.getRemainingLessons() - 1);
        packageRepository.save(userPackage);

        Reservation reservation = Reservation.builder()
                .student(student)
                .userPackage(userPackage)
                .availabilitySlot(slot)
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(ReservationStatus.CONFIRMED)
                .build();

        return reservationRepository.save(reservation);
    }

    @Transactional
    public String cancelByStudent(UUID reservationId, String username) {
        User student = userService.findUserByUsername(username);
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NotFoundException("Rezerwacja nie istnieje"));

        if (!reservation.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("Brak dostępu do rezerwacji.");
        }

        Instant now = Instant.now();
        Instant cancellationLimit = reservation.getStartTime().minus(Duration.ofHours(CANCELLATION_DEADLINE_HOURS));

        if (now.isAfter(cancellationLimit)) {
            throw new BadRequestException("Nie można odwołać lekcji później niż 12h przed jej rozpoczęciem.");
        }

        cancelReservationAndRefund(reservation);

        return "Lekcja została pomyślnie odwołana. Zwrócono 1 lekcję do pakietu.";
    }

    @Transactional
    public void cancelByTutor(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NotFoundException("Rezerwacja nie istnieje"));

        // Gdy korepetytor odwołuje lekcję, zawsze zwalniamy slot i zwracamy lekcję
        // uczniowi
        cancelReservationAndRefund(reservation);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservations(String username) {
        User user = userService.findUserByUsername(username);
        if (user.isAdmin()) {
            return reservationRepository.findAllByOrderByStartTimeDesc();
        }
        return reservationRepository.findAllByStudentIdOrderByStartTimeDesc(user.getId());
    }

    private void cancelReservationAndRefund(Reservation reservation) {
        reservation.setStatus(ReservationStatus.CANCELLED);

        AvailabilitySlot slot = reservation.getAvailabilitySlot();
        if (slot != null) {
            slot.setReserved(false);
            slotRepository.save(slot);
        }

        UserPackage userPackage = reservation.getUserPackage();
        if (userPackage != null) {
            userPackage.setRemainingLessons(userPackage.getRemainingLessons() + 1);
            packageRepository.save(userPackage);
        }

        reservationRepository.save(reservation);
    }
}