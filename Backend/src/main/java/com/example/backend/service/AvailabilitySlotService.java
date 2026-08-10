package com.example.backend.service;

import com.example.backend.model.entity.AvailabilitySlot;
import com.example.backend.model.entity.LessonOffer;
import com.example.backend.model.entity.UserPackage;
import com.example.backend.model.exception.NotFoundException;
import com.example.backend.model.request.AvailabilitySlotRequest;
import com.example.backend.model.response.AvailabilitySlotResponse;
import com.example.backend.repository.AvailabilitySlotRepository;
import com.example.backend.repository.UserPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilitySlotService {

    private final AvailabilitySlotRepository slotRepository;
    private final UserPackageRepository packageRepository;

    @Transactional
    public AvailabilitySlotResponse createSlot(AvailabilitySlotRequest request) {
        if (request.startTime().isAfter(request.endTime())) {
            throw new RuntimeException("Data rozpoczęcia musi być przed datą zakończenia");
        }
        AvailabilitySlot slot = AvailabilitySlot.builder()
                .startTime(request.startTime())
                .endTime(request.endTime())
                .level(request.level())
                .lessonType(request.lessonType())
                .isReserved(false)
                .build();
        slotRepository.save(slot);
        return toResponse(slot);
    }

    @Transactional
    public void deleteSlot(UUID id) {
        AvailabilitySlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Slot nie istnieje"));
        if (slot.isReserved()) {
            throw new RuntimeException("Nie można usunąć zarezerwowanego slotu. Najpierw anuluj rezerwację.");
        }
        slotRepository.delete(slot);
    }

    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponse> getFreeSlots(Instant from, Instant to) {
        return slotRepository.findFreeSlots(from, to).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponse> getMatchingFreeSlotsForPackage(UUID userPackageId, Instant from, Instant to) {
        UserPackage userPackage = packageRepository.findById(userPackageId)
                .orElseThrow(() -> new NotFoundException("Pakiet nie istnieje"));

        LessonOffer offer = userPackage.getLessonOffer();

        return slotRepository.findMatchingFreeSlots(from, to, offer.getLevel(), offer.getLessonType())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponse> getAllSlots(Instant from, Instant to) {
        return slotRepository.findAllByStartTimeBetween(from, to).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private AvailabilitySlotResponse toResponse(AvailabilitySlot slot) {
        return AvailabilitySlotResponse.builder()
                .id(slot.getId())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .level(slot.getLevel())
                .lessonType(slot.getLessonType())
                .isReserved(slot.isReserved())
                .build();
    }
}