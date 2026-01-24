package com.example.backend.repository;

import com.example.backend.model.entity.LessonMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LessonMaterialRepository extends JpaRepository<LessonMaterial, UUID> {
    List<LessonMaterial> findAllByReservationId(UUID reservationId);
}