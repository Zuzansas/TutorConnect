package com.example.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import com.example.backend.model.entity.User;
import com.example.backend.model.exception.BadRequestException;
import com.example.backend.model.exception.NotFoundException;
import com.example.backend.model.request.UpdateLocationRequest;
import com.example.backend.model.request.UpdateProfileRequest;
import com.example.backend.model.response.AvatarUploadResponse;
import com.example.backend.model.response.LocationUpdateResponse;
import com.example.backend.model.response.MeResponse;
import com.example.backend.model.response.PublicUserProfileResponse;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final GeocodingService geocodingService;

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono użytkownika"));
    }

    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono użytkownika"));
    }

    public User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Nie znaleziono użytkownika"));
    }

    public MeResponse getCurrentUserProfile(String username) {
        User user = findUserByUsername(username);

        return MeResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarURL())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .city(user.getCity())
                .verifiedEmail(user.getValidatedEmail())
                .build();
    }

    @Transactional
    public MeResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = findUserByUsername(username);

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName());
        }

        userRepository.save(user);
        return getCurrentUserProfile(username);
    }

    @Transactional
    public AvatarUploadResponse uploadAvatar(String username, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Plik nie może być pusty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Dopuszczalne są wyłącznie pliki graficzne");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Rozmiar pliku nie może przekraczać 5 MB");
        }

        User user = findUserByUsername(username);

        if (user.getAvatarURL() != null && !user.getAvatarURL().isEmpty()) {
            cloudinaryService.deleteImage(user.getAvatarURL());
        }

        String avatarUrl = cloudinaryService.uploadImage(file, "avatars");
        user.setAvatarURL(avatarUrl);
        userRepository.save(user);

        return AvatarUploadResponse.builder()
                .avatarUrl(avatarUrl)
                .build();
    }

    @Transactional
    public LocationUpdateResponse updateLocation(String username, UpdateLocationRequest request) {
        User user = findUserByUsername(username);

        if (request.latitude() != null) {
            if (request.latitude().compareTo(new BigDecimal("-90")) < 0 ||
                    request.latitude().compareTo(new BigDecimal("90")) > 0) {
                throw new BadRequestException("Nieprawidłowa wartość szerokości geograficznej");
            }
        }

        if (request.longitude() != null) {
            if (request.longitude().compareTo(new BigDecimal("-180")) < 0 ||
                    request.longitude().compareTo(new BigDecimal("180")) > 0) {
                throw new BadRequestException("Nieprawidłowa wartość długości geograficznej");
            }
        }

        if (request.latitude() != null && request.longitude() != null) {
            user.setLatitude(request.latitude());
            user.setLongitude(request.longitude());

            String cityFromCoordinates = geocodingService.getCityFromCoordinates(
                    request.latitude(),
                    request.longitude());

            if (cityFromCoordinates != null) {
                user.setCity(cityFromCoordinates);
            } else {
                user.setCity("Nieokreślone");
            }
        } else {
            throw new BadRequestException("Współrzędne GPS są wymagane");
        }

        userRepository.save(user);

        return LocationUpdateResponse.builder()
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .city(user.getCity())
                .build();
    }

    public PublicUserProfileResponse getPublicUserProfile(UUID userId) {
        User targetUser = findUserById(userId);

        if (!targetUser.getActive()) {
            throw new NotFoundException("Nie znaleziono użytkownika");
        }

        return PublicUserProfileResponse.builder()
                .id(targetUser.getId())
                .phoneNumber(targetUser.getPhoneNumber())
                .email(targetUser.getEmail())
                .fullName(targetUser.getFullName())
                .avatarUrl(targetUser.getAvatarURL())
                .city(targetUser.getCity())
                .lastActiveAt(targetUser.getLastActiveAt())
                .verifiedEmail(targetUser.getValidatedEmail())
                .build();
    }
}
