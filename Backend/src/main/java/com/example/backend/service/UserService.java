package com.example.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import com.example.backend.model.entity.User;
import com.example.backend.model.exception.AuthException;
import com.example.backend.model.exception.BadRequestException;
import com.example.backend.model.exception.NotFoundException;
import com.example.backend.model.request.ChangeEmailRequest;
import com.example.backend.model.request.ChangePasswordRequest;
import com.example.backend.model.request.UpdateLocationRequest;
import com.example.backend.model.request.UpdateProfileRequest;
import com.example.backend.model.response.AvatarUploadResponse;
import com.example.backend.model.response.ChangeEmailResponse;
import com.example.backend.model.response.ChangePasswordResponse;
import com.example.backend.model.response.LocationUpdateResponse;
import com.example.backend.model.response.MeResponse;
import com.example.backend.model.response.PublicUserProfileResponse;
import com.example.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

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
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarURL())
                .bio(user.getBio())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .city(user.getCity())
                .rating(user.getRating())
                .totalExchanges(user.getTotalExchanges())
                .verifiedEmail(user.getValidatedEmail())
                .build();
    }

    @Transactional
    public MeResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = findUserByUsername(username);

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName());
        }

        if (request.bio() != null) {
            if (request.bio().length() > 500) {
                throw new BadRequestException("Bio nie może przekraczać 500 znaków");
            }
            user.setBio(request.bio());
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
    public void deleteAvatar(String username) {
        User user = findUserByUsername(username);

        if (user.getAvatarURL() != null && !user.getAvatarURL().isEmpty()) {
            cloudinaryService.deleteImage(user.getAvatarURL());

            user.setAvatarURL(null);
            userRepository.save(user);
        }
    }

    @Transactional
    public LocationUpdateResponse updateLocation(String username, UpdateLocationRequest request) {
        User user = findUserByUsername(username);

        user.setCity(request.city());

        userRepository.save(user);

        return LocationUpdateResponse.builder()
                .city(user.getCity())
                .build();
    }

    @Transactional
    public ChangePasswordResponse changePassword(String username, ChangePasswordRequest request) {
        User user = findUserByUsername(username);

        if (!request.newPassword().equals(request.confirmNewPassword())) {
            throw new BadRequestException("Nowe hasła nie są zgodne");
        }

        if (request.currentPassword().equals(request.newPassword())) {
            throw new BadRequestException("Nowe hasło musi być różne od aktualnego hasła");
        }

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new AuthException("Nieprawidłowe aktualne hasło");
        }

        String encodedPassword = passwordEncoder.encode(request.newPassword());
        user.setPassword(encodedPassword);
        userRepository.save(user);

        return ChangePasswordResponse.builder()
                .message("Hasło zostało pomyślnie zmienione")
                .build();
    }

    @Transactional
    public ChangeEmailResponse changeEmail(String username, ChangeEmailRequest request) {
        User user = findUserByUsername(username);

        if (!request.newEmail().equals(request.confirmNewEmail())) {
            throw new BadRequestException("Adresy e-mail nie są zgodne");
        }

        if (request.newEmail().equalsIgnoreCase(user.getEmail())) {
            throw new BadRequestException("Nowy adres e-mail musi być różny od aktualnego");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AuthException("Nieprawidłowe hasło");
        }

        if (userRepository.existsByEmail(request.newEmail())) {
            throw new BadRequestException("Podany adres e-mail jest już zajęty");
        }

        if (userRepository.existsByUsername(request.newEmail())) {
            throw new BadRequestException("Podany adres e-mail jest już zajęty");
        }

        user.setEmail(request.newEmail());
        user.setUsername(request.newEmail());
        user.setValidatedEmail(false);
        userRepository.save(user);

        return ChangeEmailResponse.builder()
                .newEmail(user.getEmail())
                .message("Adres e-mail został zmieniony.")
                .verifiedEmail(false)
                .build();
    }

    public PublicUserProfileResponse getPublicUserProfile(UUID userId) {
        User targetUser = findUserById(userId);

        if (!targetUser.getActive()) {
            throw new NotFoundException("Nie znaleziono użytkownika");
        }

        return PublicUserProfileResponse.builder()
                .id(targetUser.getId())
                .fullName(targetUser.getFullName())
                .avatarUrl(targetUser.getAvatarURL())
                .bio(targetUser.getBio())
                .city(targetUser.getCity())
                .rating(targetUser.getRating())
                .totalExchanges(targetUser.getTotalExchanges())
                .lastActiveAt(targetUser.getLastActiveAt())
                .verifiedEmail(targetUser.getValidatedEmail())
                .build();
    }

    public void validateAdminAccess(String username) {
        User user = findUserByUsername(username);

        if (!user.isAdmin()) {
            throw new BadRequestException("Brak uprawnień administratora do wykonania tej operacji.");
        }
    }

    public void deactivateUser(String username) {
        User user = findUserByUsername(username);

        user.setActive(false);

        saveUser(user);
    }
}
