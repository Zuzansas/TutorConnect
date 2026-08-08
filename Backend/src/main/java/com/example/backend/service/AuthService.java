package com.example.backend.service;

import com.example.backend.model.entity.PasswordResetToken;
import com.example.backend.model.entity.RefreshToken;
import com.example.backend.model.entity.User;
import com.example.backend.model.exception.AuthException;
import com.example.backend.model.request.LoginRequest;
import com.example.backend.model.request.RegisterRequest;
import com.example.backend.model.response.LoginResponse;
import com.example.backend.model.response.RegisterResponse;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final CloudinaryService cloudinaryService;

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    public RegisterResponse register(RegisterRequest request, MultipartFile avatar) {
        if (userService.existsByEmail(request.email())) {
            throw new AuthException("Adres e-mail jest już używany");
        }

        if (!request.password().equals(request.repeatedPassword())) {
            throw new AuthException("Hasła nie są takie same");
        }

        String avatarUrl = null;
        if (avatar != null && !avatar.isEmpty()) {
            avatarUrl = cloudinaryService.uploadImage(avatar, "avatars");
        }

        User user = User.builder()
                .username(request.email())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .city(request.city())
                .bio(request.bio())
                .avatarURL(avatarUrl)
                .createdAt(Instant.now())
                .build();

        userService.saveUser(user);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        String accessToken = tokenProvider.generateToken(user);

        return RegisterResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    @Transactional
    public void processForgotPassword(String email) {
        User user = userService.findUserByEmail(email);

        String resetToken = UUID.randomUUID().toString();

        passwordResetTokenRepository.deleteByUserId(user.getId());
        passwordResetTokenRepository
                .save(new PasswordResetToken(resetToken, user, Instant.now().plus(30, ChronoUnit.MINUTES)));
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new AuthException("Nieprawidłowy lub wygasły token"));

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new AuthException("Token wygasł");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userService.saveUser(user);

        passwordResetTokenRepository.delete(resetToken);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userService.findUserByEmail(request.email());

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AuthException("Nieprawidłowe hasło");
        }

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        String accessToken = tokenProvider.generateToken(user);
        String role = Boolean.TRUE.equals(user.getAdmin()) ? "ADMIN" : "USER";

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .role(role)
                .build();
    }
}