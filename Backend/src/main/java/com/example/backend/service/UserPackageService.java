package com.example.backend.service;

import com.example.backend.model.entity.LessonOffer;
import com.example.backend.model.entity.User;
import com.example.backend.model.entity.UserPackage;
import com.example.backend.model.exception.NotFoundException;
import com.example.backend.model.response.LessonOfferResponse;
import com.example.backend.model.response.UserPackageResponse;
import com.example.backend.repository.LessonOfferRepository;
import com.example.backend.repository.UserPackageRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserPackageService {

        private final UserPackageRepository packageRepository;
        private final LessonOfferRepository offerRepository;
        private final UserService userService;
        private final EmailService emailService;

        @Value("${stripe.api.key:}")
        private String stripeApiKey;

        @Value("${app.frontend.url:http://localhost:3000}")
        private String frontendUrl;

        @PostConstruct
        public void init() {
                Stripe.apiKey = stripeApiKey;
        }

        public String createCheckoutSession(UUID offerId, String username) throws StripeException {
                User user = userService.findUserByUsername(username);
                LessonOffer offer = offerRepository.findById(offerId)
                                .orElseThrow(() -> new NotFoundException("Oferta nie istnieje"));

                long amountInCents = offer.getPrice().multiply(new BigDecimal("100")).longValue();

                SessionCreateParams params = SessionCreateParams.builder()
                                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.BLIK)
                                .setMode(SessionCreateParams.Mode.PAYMENT)
                                .setSuccessUrl(frontendUrl + "/payment/success?session_id={CHECKOUT_SESSION_ID}")
                                .setCancelUrl(frontendUrl + "/payment/cancel")
                                .setCustomerEmail(user.getEmail())
                                // ⬇️ PRZEKAZUJEMY NIEZMIENNE ID
                                .putMetadata("offerId", offer.getId().toString())
                                .putMetadata("userId", user.getId().toString())
                                .addLineItem(
                                                SessionCreateParams.LineItem.builder()
                                                                .setQuantity(1L)
                                                                .setPriceData(
                                                                                SessionCreateParams.LineItem.PriceData
                                                                                                .builder()
                                                                                                .setCurrency("pln")
                                                                                                .setUnitAmount(amountInCents)
                                                                                                .setProductData(
                                                                                                                SessionCreateParams.LineItem.PriceData.ProductData
                                                                                                                                .builder()
                                                                                                                                .setName(offer.getTitle())
                                                                                                                                .setDescription("Pakiet lekcji: "
                                                                                                                                                + offer.getTotalLessons())
                                                                                                                                .build())
                                                                                                .build())
                                                                .build())
                                .build();

                Session session = Session.create(params);
                return session.getUrl();
        }

        @Transactional
        public void fulfillOrder(String userIdStr, String offerIdStr) {
                try {
                        System.out.println("--------------------------------------------------");
                        System.out.println("🚀 [WEBHOOK] Rozpoczynam zapisywanie pakietu...");

                        UUID userId = UUID.fromString(userIdStr);
                        UUID offerId = UUID.fromString(offerIdStr);

                        User user = userService.findUserById(userId);
                        LessonOffer offer = offerRepository.findById(offerId)
                                        .orElseThrow(() -> new NotFoundException(
                                                        "Oferta nie istnieje o ID: " + offerId));

                        UserPackage userPackage = UserPackage.builder()
                                        .user(user)
                                        .lessonOffer(offer)
                                        .remainingLessons(offer.getTotalLessons() != null ? offer.getTotalLessons() : 4)
                                        .purchasedAt(Instant.now())
                                        .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                                        .build();

                        UserPackage savedPackage = packageRepository.save(userPackage);
                        System.out.println("🎉 [SUCCESS] Zapisano pakiet o ID: " + savedPackage.getId());

                        emailService.sendPackagePurchaseConfirmationEmail(
                                        user.getEmail(),
                                        user.getFullName(),
                                        offer.getTitle(),
                                        savedPackage.getRemainingLessons(),
                                        offer.getPrice());

                        System.out.println("--------------------------------------------------");

                } catch (Exception e) {
                        System.err.println("❌ [ERROR] Błąd podczas zapisu pakietu w fulfillOrder:");
                        e.printStackTrace();
                }
        }

        @Transactional(readOnly = true)
        public List<UserPackageResponse> getUserActivePackages(String username) {
                User user = userService.findUserByUsername(username);
                List<UserPackage> packages = packageRepository.findByUserIdAndRemainingLessonsGreaterThan(user.getId(),
                                0);

                return packages.stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        private UserPackageResponse toResponse(UserPackage pkg) {
                LessonOffer offer = pkg.getLessonOffer();

                LessonOfferResponse offerResponse = new LessonOfferResponse(
                                offer.getId(),
                                offer.getTitle(),
                                offer.getDescription(),
                                offer.getLevel(),
                                offer.getLessonType(),
                                offer.getTotalLessons(),
                                offer.getPrice(),
                                offer.getDurationMinutes(),
                                offer.getViewsCount(),
                                offer.getCourseSteps(),
                                offer.getImageUrl());

                return UserPackageResponse.builder()
                                .id(pkg.getId())
                                .remainingLessons(pkg.getRemainingLessons())
                                .purchasedAt(pkg.getPurchasedAt())
                                .expiresAt(pkg.getExpiresAt())
                                .lessonOffer(offerResponse)
                                .build();
        }
}