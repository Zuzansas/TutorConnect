package com.example.backend.service;

import com.example.backend.model.entity.LessonOffer;
import com.example.backend.model.request.CreateLessonOfferRequest;
import com.example.backend.model.request.UpdateLessonOfferRequest;
import com.example.backend.model.response.LessonOfferResponse;
import com.example.backend.repository.LessonOfferRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonOfferService {

    private final LessonOfferRepository lessonOfferRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public LessonOfferResponse createOffer(CreateLessonOfferRequest request, MultipartFile image) {
        String imageUrl = null;

        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image, "offers");
        }

        LessonOffer offer = LessonOffer.builder()
                .title(request.title())
                .description(request.description())
                .level(request.level())
                .price(request.price())
                .durationMinutes(request.durationMinutes())
                .courseSteps(request.courseSteps())
                .imageUrl(imageUrl)
                .viewsCount(0)
                .build();

        lessonOfferRepository.save(offer);
        return toResponse(offer);
    }

    public LessonOfferResponse updateOffer(UUID id, UpdateLessonOfferRequest request, MultipartFile image) {
        LessonOffer offer = lessonOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferta nie istnieje"));

        if (request.title() != null)
            offer.setTitle(request.title());
        if (request.description() != null)
            offer.setDescription(request.description());
        if (request.level() != null)
            offer.setLevel(request.level());
        if (request.price() != null)
            offer.setPrice(request.price());
        if (request.courseSteps() != null) {
            offer.getCourseSteps().clear();
            offer.getCourseSteps().addAll(request.courseSteps());
        }

        if (image != null && !image.isEmpty()) {
            cloudinaryService.deleteImage(offer.getImageUrl());
            String newImageUrl = cloudinaryService.uploadImage(image, "offers");
            offer.setImageUrl(newImageUrl);
        }
        if (request.durationMinutes() != null)
            offer.setDurationMinutes(request.durationMinutes());

        lessonOfferRepository.save(offer);

        return toResponse(offer);
    }

    public void deleteOffer(UUID id) {
        if (!lessonOfferRepository.existsById(id)) {
            throw new RuntimeException("Oferta nie istnieje");
        }
        lessonOfferRepository.deleteById(id);
    }

    public LessonOfferResponse getOffer(UUID id) {
        LessonOffer offer = lessonOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferta nie istnieje"));

        return toResponse(offer);
    }

    public List<LessonOfferResponse> getAllOffers() {
        List<LessonOffer> allOffers = lessonOfferRepository.findAll();

        return allOffers.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private LessonOfferResponse toResponse(LessonOffer o) {
        return new LessonOfferResponse(
                o.getId(),
                o.getTitle(),
                o.getDescription(),
                o.getLevel(),
                o.getPrice(),
                o.getDurationMinutes(),
                o.getViewsCount(),
                o.getCourseSteps(),
                o.getImageUrl());
    }
}