package com.example.backend.service;

import com.example.backend.model.entity.Review;
import com.example.backend.model.entity.User;
import com.example.backend.model.enums.ReservationStatus;
import com.example.backend.model.exception.ReviewNotAllowedException;
import com.example.backend.repository.ReservationRepository;
import com.example.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import javax.crypto.BadPaddingException;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;

    @Transactional
    public Review createReview(Review review) {

        boolean hasCompletedLesson = reservationRepository.existsByStudentIdAndLessonOfferIdAndStatus(
                review.getReviewer().getId(),
                review.getReviewedLessonId(),
                ReservationStatus.COMPLETED);

        if (!hasCompletedLesson) {
            throw new ReviewNotAllowedException(
                    "Możesz wystawić opinię tylko po zakończeniu lekcji (status COMPLETED).");
        }

        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(Long reviewId, User currentUser) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Opinia o podanym ID nie istnieje."));

        boolean isAdmin = currentUser.getAdmin();
        boolean isAuthor = review.getReviewer().getId().equals(currentUser.getId());

        if (isAdmin || isAuthor) {
            reviewRepository.delete(review);
        } else {
            throw new RuntimeException("Brak uprawnień: Tylko autor lub administrator może usunąć tę opinię.");
        }
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public List<Review> getReviewsByUser(UUID userId) {
        return reviewRepository.findByReviewerId(userId);
    }
}