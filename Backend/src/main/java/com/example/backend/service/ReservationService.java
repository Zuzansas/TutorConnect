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
    private final EmailService emailService;

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

        boolean alreadyBookedByStudent = reservationRepository
                .findAllByStudentIdOrderByStartTimeDesc(student.getId()).stream()
                .anyMatch(r -> r.getAvailabilitySlot() != null
                        && r.getAvailabilitySlot().getId().equals(slotId)
                        && r.getStatus() != ReservationStatus.CANCELLED);

        if (alreadyBookedByStudent) {
            throw new BadRequestException("Jesteś już zapisany/a na ten termin.");
        }

        String slotType = slot.getLessonType() != null ? slot.getLessonType().toString().toLowerCase() : "";
        boolean isGroup = slotType.contains("group") || slotType.contains("grup");

        int maxCapacity = isGroup ? 5 : 1;

        long currentBookingsCount = reservationRepository.countByAvailabilitySlotIdAndStatusNot(slot.getId(),
                ReservationStatus.CANCELLED);

        if (currentBookingsCount >= maxCapacity) {
            throw new BadRequestException("Brak wolnych miejsc w tej grupie (zapisano maksymalną liczbę uczniów).");
        }

        LessonOffer offer = userPackage.getLessonOffer();

        String slotLevel = slot.getLevel() != null ? slot.getLevel().toString().trim() : "";
        String offerLevel = offer.getLevel() != null ? offer.getLevel().toString().trim() : "";
        boolean levelMatches = slotLevel.equalsIgnoreCase(offerLevel);

        String offerType = offer.getLessonType() != null ? offer.getLessonType().toString().toLowerCase() : "";
        boolean isOfferGroup = offerType.contains("group") || offerType.contains("grup");

        boolean typeMatches = (isGroup == isOfferGroup);

        if (!levelMatches || !typeMatches) {
            throw new BadRequestException(
                    String.format("Termin (%s / %s) nie odpowiada wykupionemu pakietowi (%s / %s).",
                            slotLevel, slotType, offerLevel, offerType));
        }

        if (currentBookingsCount + 1 >= maxCapacity) {
            slot.setReserved(true);
            slotRepository.save(slot);
        }

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

        Reservation savedReservation = reservationRepository.save(reservation);

        try {
            emailService.sendReservationConfirmationEmail(
                    student.getEmail(),
                    student.getFullName(),
                    userPackage.getLessonOffer().getTitle(),
                    savedReservation.getStartTime(),
                    savedReservation.getEndTime(),
                    userPackage.getRemainingLessons());
        } catch (Exception e) {
            System.err
                    .println("Nie udało się wysłać maila, ale rezerwacja została utworzona w bazie: " + e.getMessage());
        }

        return savedReservation;
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

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BadRequestException("Ta rezerwacja jest już odwołana.");
        }

        Instant now = Instant.now();
        Instant cancellationLimit = reservation.getStartTime().minus(Duration.ofHours(CANCELLATION_DEADLINE_HOURS));

        boolean isLateCancellation = now.isAfter(cancellationLimit);

        reservation.setStatus(ReservationStatus.CANCELLED);

        AvailabilitySlot slot = reservation.getAvailabilitySlot();
        if (slot != null) {
            slot.setReserved(false);
            slotRepository.save(slot);
        }

        reservationRepository.save(reservation);

        boolean isRefunded = !isLateCancellation;

        if (isRefunded) {
            UserPackage userPackage = reservation.getUserPackage();
            if (userPackage != null) {
                userPackage.setRemainingLessons(userPackage.getRemainingLessons() + 1);
                packageRepository.save(userPackage);
            }
        }

        try {
            emailService.sendReservationCancellationEmail(
                    student.getEmail(),
                    student.getFullName(),
                    getLessonTitleSafely(reservation),
                    reservation.getStartTime(),
                    isRefunded,
                    false);
        } catch (Exception e) {
            System.err.println("Nie udało się wysłać maila o anulowaniu: " + e.getMessage());
        }

        if (isRefunded) {
            return "Lekcja została odwołana z odpowiednim wyprzedzeniem. Zwrócono 1 lekcję do Twojego pakietu.";
        } else {
            return "Lekcja została odwołana na mniej niż 12h przed zajęciami. Lekcja NIE została zwrócona do pakietu.";
        }
    }

    @Transactional
    public void cancelByTutor(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NotFoundException("Rezerwacja nie istnieje"));

        cancelReservationAndRefund(reservation);

        try {
            User student = reservation.getStudent();

            emailService.sendReservationCancellationEmail(
                    student.getEmail(),
                    student.getFullName(),
                    getLessonTitleSafely(reservation),
                    reservation.getStartTime(),
                    true,
                    true);
        } catch (Exception e) {
            System.err.println("Nie udało się wysłać e-maila o anulowaniu przez Korepetytora: " + e.getMessage());
        }
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

    private String getLessonTitleSafely(Reservation reservation) {
        if (reservation.getUserPackage() != null && reservation.getUserPackage().getLessonOffer() != null) {
            return reservation.getUserPackage().getLessonOffer().getTitle();
        }
        return "Lekcja";
    }
}