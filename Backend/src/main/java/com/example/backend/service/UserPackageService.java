package com.example.backend.service;

import com.example.backend.model.entity.LessonOffer;
import com.example.backend.model.entity.User;
import com.example.backend.model.entity.UserPackage;
import com.example.backend.model.exception.NotFoundException;
import com.example.backend.model.response.LessonOfferResponse;
import com.example.backend.model.response.UserPackageResponse;
import com.example.backend.repository.LessonOfferRepository;
import com.example.backend.repository.UserPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserPackageService {

    private final UserPackageRepository packageRepository;
    private final LessonOfferRepository offerRepository;
    private final UserService userService;

    @Transactional
    public UserPackageResponse purchasePackage(UUID offerId, String username) {
        User user = userService.findUserByUsername(username);
        LessonOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Oferta nie istnieje"));

        UserPackage userPackage = UserPackage.builder()
                .user(user)
                .lessonOffer(offer)
                .remainingLessons(offer.getTotalLessons() != null ? offer.getTotalLessons() : 4)
                .purchasedAt(Instant.now())
                .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                .build();

        UserPackage saved = packageRepository.save(userPackage);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<UserPackageResponse> getUserActivePackages(String username) {
        User user = userService.findUserByUsername(username);
        List<UserPackage> packages = packageRepository.findByUserIdAndRemainingLessonsGreaterThan(user.getId(), 0);

        return packages.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private UserPackageResponse toResponse(UserPackage pkg) {
        LessonOffer offer = pkg.getLessonOffer();

        LessonOfferResponse offerResponse = new LessonOfferResponse(
                offer.getId(),
                offer.getTitle(),
                offer.getDescription(),
                offer.getLevel(),
                offer.getLessonType(),
                offer.getTotalLessons(),
                offer.getPrice(),
                offer.getDurationMinutes(),
                offer.getViewsCount(),
                offer.getCourseSteps(),
                offer.getImageUrl());

        return UserPackageResponse.builder()
                .id(pkg.getId())
                .remainingLessons(pkg.getRemainingLessons())
                .purchasedAt(pkg.getPurchasedAt())
                .expiresAt(pkg.getExpiresAt())
                .lessonOffer(offerResponse)
                .build();
    }
}