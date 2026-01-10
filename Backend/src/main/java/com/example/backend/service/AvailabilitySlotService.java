package com.example.backend.service;

import com.example.backend.model.entity.AvailabilitySlot;
import com.example.backend.model.request.AvailabilitySlotRequest;
import com.example.backend.model.response.AvailabilitySlotResponse;
import com.example.backend.repository.AvailabilitySlotRepository;
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

    /**
     * Dla Admina: Tworzy nowy wolny termin.
     */
    @Transactional
    public AvailabilitySlotResponse createSlot(AvailabilitySlotRequest request) {
        if (request.startTime().isAfter(request.endTime())) {
            throw new RuntimeException("Data rozpoczęcia musi być przed datą zakończenia");
        }

        // Tu można dodać walidację, czy slot nie nakłada się na inny istniejący

        AvailabilitySlot slot = AvailabilitySlot.builder()
                .startTime(request.startTime())
                .endTime(request.endTime())
                .isReserved(false)
                .build();

        slotRepository.save(slot);

        return toResponse(slot);
    }

    /**
     * Dla Admina: Usuwa slot (np. pomyłka lub zmiana planów).
     */
    @Transactional
    public void deleteSlot(UUID id) {
        AvailabilitySlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot nie istnieje"));

        if (slot.isReserved()) {
            throw new RuntimeException("Nie można usunąć zarezerwowanego slotu. Najpierw anuluj rezerwację.");
        }

        slotRepository.delete(slot);
    }

    /**
     * Dla Frontendu: Pobiera wolne sloty w zadanym zakresie dat.
     */
    public List<AvailabilitySlotResponse> getFreeSlots(Instant from, Instant to) {
        return slotRepository.findFreeSlots(from, to).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Mapper
    private AvailabilitySlotResponse toResponse(AvailabilitySlot slot) {
        return AvailabilitySlotResponse.builder()
                .id(slot.getId())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .isReserved(slot.isReserved())
                .build();
    }
}