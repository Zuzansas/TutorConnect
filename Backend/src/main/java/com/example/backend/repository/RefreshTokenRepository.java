package com.example.backend.repository;

import com.example.backend.model.entity.RefreshToken;
import com.example.backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findRefreshTokenByUser(User user);
}
