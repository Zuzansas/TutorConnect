package com.example.backend.repository;

import com.example.backend.model.entity.UserPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface UserPackageRepository extends JpaRepository<UserPackage, UUID> {
    List<UserPackage> findByUserIdAndRemainingLessonsGreaterThan(UUID userId, Integer remainingLessons);

    List<UserPackage> findByUserId(UUID userId);
}