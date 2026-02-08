package com.example.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.example.backend.model.response.ErrorResponse;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtAuthenticationFilter;
import com.example.backend.security.JwtTokenProvider;
import com.example.backend.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableAsync
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
        private final JwtTokenProvider jwtTokenProvider;
        private final CustomUserDetailsService userDetailsService;
        private final CorsConfig corsConfig;
        private final UserRepository userRepository;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                return http
                                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .userDetailsService(userDetailsService)
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        response.setContentType("application/json");
                                                        response.setCharacterEncoding("UTF-8");

                                                        ErrorResponse errorResponse = new ErrorResponse(
                                                                        "UNAUTHORIZED",
                                                                        "Brak tokenu autoryzacyjnego lub token jest nieprawidłowy");

                                                        ObjectMapper mapper = new ObjectMapper();
                                                        response.getWriter().write(
                                                                        mapper.writeValueAsString(errorResponse));
                                                }))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/api/v1/auth/**",
                                                                "/v2/api-docs",
                                                                "/v3/api-docs/**",
                                                                "/configuration/**",
                                                                "/webjars/**",
                                                                "/swagger-resources/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html")
                                                .permitAll()
                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/api/lesson-offers/all",
                                                                "/api/lesson-offers/{id}",
                                                                "/api/reviews/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .addFilterBefore(
                                                new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService,
                                                                userRepository),
                                                UsernamePasswordAuthenticationFilter.class)
                                .build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}