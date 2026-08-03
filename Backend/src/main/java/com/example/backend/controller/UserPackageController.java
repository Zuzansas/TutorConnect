package com.example.backend.controller;

import com.example.backend.model.response.UserPackageResponse;
import com.example.backend.service.UserPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class UserPackageController {

    private final UserPackageService packageService;

    @PostMapping("/purchase/{offerId}")
    public ResponseEntity<UserPackageResponse> purchasePackage(@PathVariable UUID offerId, Principal principal) {
        return ResponseEntity.ok(packageService.purchasePackage(offerId, principal.getName()));
    }

    @GetMapping("/my-active")
    public ResponseEntity<List<UserPackageResponse>> getMyPackages(Principal principal) {
        return ResponseEntity.ok(packageService.getUserActivePackages(principal.getName()));
    }
}