package com.example.backend.controller;

import com.example.backend.model.response.UserPackageResponse;
import com.example.backend.service.UserPackageService;
import com.stripe.exception.StripeException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Packages", description = "API do zarządzania pakietami lekcji i płatnościami")
@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class UserPackageController {

    private final UserPackageService packageService;

    @Operation(summary = "Inicjalizacja płatności Stripe", description = "Tworzy sesję Checkout w Stripe i zwraca URL do przekierowania")
    @PostMapping("/create-checkout-session/{offerId}")
    public ResponseEntity<Map<String, String>> createCheckoutSession(
            @PathVariable UUID offerId,
            @AuthenticationPrincipal UserDetails userDetails) throws StripeException {

        String checkoutUrl = packageService.createCheckoutSession(offerId, userDetails.getUsername());

        return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
    }

    @Operation(summary = "Pobierz aktywne pakiety użytkownika")
    @GetMapping("/my")
    public ResponseEntity<List<UserPackageResponse>> getMyPackages(@AuthenticationPrincipal UserDetails userDetails) {
        List<UserPackageResponse> packages = packageService.getUserActivePackages(userDetails.getUsername());
        return ResponseEntity.ok(packages);
    }
}