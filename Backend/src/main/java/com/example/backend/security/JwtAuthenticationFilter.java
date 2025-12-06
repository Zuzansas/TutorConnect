package com.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.example.backend.repository.UserRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    private static final Map<String, Instant> lastActivityCache = new ConcurrentHashMap<>();
    private static final Duration UPDATE_THRESHOLD = Duration.ofMinutes(5);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String token = jwtTokenProvider.resolveToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            String username = jwtTokenProvider.getUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null,
                    userDetails.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);

            updateUserActivityIfNeeded(username);
        }
        filterChain.doFilter(request, response);
    }

    private void updateUserActivityIfNeeded(String username) {
        Instant lastUpdate = lastActivityCache.get(username);
        Instant now = Instant.now();

        if (lastUpdate == null || Duration.between(lastUpdate, now).compareTo(UPDATE_THRESHOLD) > 0) {
            updateUserActivityAsync(username);
            lastActivityCache.put(username, now);
        }
    }

    @Async
    protected void updateUserActivityAsync(String username) {
        try {
            userRepository.updateLastActiveAtByUsername(username, Instant.now());
        } catch (Exception ignored) {
        }
    }
}
