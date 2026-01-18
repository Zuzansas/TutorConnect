package com.example.backend.service;

import com.example.backend.model.entity.Review;
import com.example.backend.model.entity.User;
import com.example.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Transactional
    public Review createReview(Review review) {
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
}