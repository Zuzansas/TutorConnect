package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.entity.Review;
import java.util.UUID;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByReviewerId(java.util.UUID reviewerId);

    boolean existsByReviewerIdAndReviewedLessonId(UUID reviewerId, UUID reviewedLessonId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "reviewer" })
    List<Review> findAll();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "reviewer" })
    List<Review> findByReviewedLessonId(java.util.UUID reviewedLessonId);

}
