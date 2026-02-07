package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import com.example.backend.model.entity.RefreshToken;
import com.example.backend.model.entity.User;
import com.example.backend.model.exception.AuthException;
import com.example.backend.model.request.LoginRequest;
import com.example.backend.model.request.RegisterRequest;
import com.example.backend.model.response.LoginResponse;
import com.example.backend.model.response.RegisterResponse;
import com.example.backend.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final CloudinaryService cloudinaryService;

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
                .createdAt(Instant.now()).build();

        userService.saveUser(user);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        String accessToken = tokenProvider.generateToken(user);

        return RegisterResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken()).build();
    }

    public LoginResponse login(LoginRequest request) {
        User user = userService.findUserByEmail(request.email());

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AuthException("Nieprawidłowe hasło");
        }

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        String accessToken = tokenProvider.generateToken(user);
        String role = user.getAdmin() ? "ADMIN" : "USER";
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .role(role).build();
    }
}
