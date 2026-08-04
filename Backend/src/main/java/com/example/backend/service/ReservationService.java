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
    private final UserRepository userRepository;

    private static final long CANCELLATION_DEADLINE_HOURS = 12;

    @Transactional
    public Reservation createReservation(UUID userPackageId, UUID slotId, String principalName) {
        User student = userRepository.findByEmail(principalName)
                .orElseGet(() -> userRepository.findByUsername(principalName)
                        .orElseThrow(() -> new NotFoundException("Użytkownik nie istnieje: " + principalName)));

        UserPackage userPackage = packageRepository.findById(userPackageId)
                .orElseThrow(() -> new NotFoundException("Pakiet nie istnieje"));

        if (!userPackage.getUser().getId().equals(student.getId())) {
            throw new BadRequestException("Pakiet nie należy do zalogowanego użytkownika.");
        }

        if (userPackage.getRemainingLessons() <= 0) {
            throw new BadRequestException("Brak dostępnych lekcji w tym pakiecie.");
        }

        AvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new NotFoundException("Termin nie istnieje"));

        if (slot.isReserved()) {
            throw new BadRequestException("Ten termin jest już zarezerwowany.");
        }

        LessonOffer offer = userPackage.getLessonOffer();

        String slotLevel = slot.getLevel() != null ? slot.getLevel().toString().trim() : "";
        String offerLevel = offer.getLevel() != null ? offer.getLevel().toString().trim() : "";
        boolean levelMatches = slotLevel.equalsIgnoreCase(offerLevel);

        String slotType = slot.getLessonType() != null ? slot.getLessonType().toString().toLowerCase() : "";
        String offerType = offer.getLessonType() != null ? offer.getLessonType().toString().toLowerCase() : "";

        boolean isSlotGroup = slotType.contains("group") || slotType.contains("grup");
        boolean isOfferGroup = offerType.contains("group") || offerType.contains("grup");

        boolean typeMatches = (isSlotGroup == isOfferGroup);

        if (!levelMatches || !typeMatches) {
            throw new BadRequestException(
                    String.format("Termin (%s / %s) nie odpowiada wykupionemu pakietowi (%s / %s).",
                            slotLevel, slotType, offerLevel, offerType));
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
                .price(offer.getPrice())
                .status(ReservationStatus.CONFIRMED)
                .build();

        return reservationRepository.save(reservation);
    }

    @Transactional
    public String cancelByStudent(UUID reservationId, String principalName) {
        User student = userRepository.findByEmail(principalName)
                .orElseGet(() -> userRepository.findByUsername(principalName)
                        .orElseThrow(() -> new NotFoundException("Użytkownik nie istnieje")));

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NotFoundException("Rezerwacja nie istnieje"));

        if (!reservation.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("Brak dostępu do tej rezerwacji.");
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

        cancelReservationAndRefund(reservation);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservations(String principalName) {
        User user = userRepository.findByEmail(principalName)
                .orElseGet(() -> userRepository.findByUsername(principalName)
                        .orElseThrow(() -> new NotFoundException("Użytkownik nie istnieje")));

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