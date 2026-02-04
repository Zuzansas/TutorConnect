package com.example.backend.service;

import com.example.backend.model.entity.LessonMaterial;
import com.example.backend.model.entity.Reservation;
import com.example.backend.model.entity.User;
import com.example.backend.model.exception.BadRequestException;
import com.example.backend.model.exception.ForbiddenException;
import com.example.backend.model.exception.NotFoundException;
import com.example.backend.model.response.LessonMaterialResponse;
import com.example.backend.repository.LessonMaterialRepository;
import com.example.backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonMaterialService {

    private final LessonMaterialRepository lessonMaterialRepository;
    private final ReservationRepository reservationRepository;
    private final CloudinaryService cloudinaryService;
    private final UserService userService;

    @Transactional
    public LessonMaterialResponse addMaterial(UUID reservationId, String username, MultipartFile file, String title,
            String description) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NotFoundException("Rezerwacja nie istnieje"));

        User user = userService.findUserByUsername(username);
        if (!user.isAdmin()) {
            throw new ForbiddenException("Brak uprawnień do dodawania materiałów.");
        }

        if (file.isEmpty()) {
            throw new BadRequestException("Plik nie może być pusty");
        }

        String fileUrl = cloudinaryService.uploadImage(file, "materials");

        LessonMaterial material = LessonMaterial.builder()
                .reservation(reservation)
                .title(title)
                .description(description)
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .build();

        lessonMaterialRepository.save(material);

        return mapToResponse(material);
    }

    public List<LessonMaterialResponse> getMaterialsForReservation(UUID reservationId, String username) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NotFoundException("Rezerwacja nie istnieje"));

        User user = userService.findUserByUsername(username);
        boolean isStudent = reservation.getStudent().getId().equals(user.getId());
        boolean isAdmin = user.isAdmin();

        if (!isStudent && !isAdmin) {
            throw new ForbiddenException("Nie masz dostępu do materiałów tej lekcji.");
        }

        return lessonMaterialRepository.findAllByReservationId(reservationId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private LessonMaterialResponse mapToResponse(LessonMaterial material) {
        return new LessonMaterialResponse(
                material.getId(),
                material.getTitle(),
                material.getDescription(),
                material.getFileUrl(),
                material.getFileType(),
                material.getCreatedAt());
    }
}