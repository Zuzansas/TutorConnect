package com.example.backend.controller;

import com.example.backend.service.UserPackageService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/webhooks/stripe")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final UserPackageService packageService;

    @Value("${stripe.webhook.secret:}")
    private String endpointSecret;

    @PostMapping
    public ResponseEntity<String> handleStripeEvent(@RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        try {
            // Parsujemy pełny payload bezpośrednio do drzewa JSON (100% niezawodne)
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(payload);

            String eventType = rootNode.path("type").asText();
            log.info("📩 Otrzymano zdarzenie ze Stripe: {}", eventType);

            if ("checkout.session.completed".equals(eventType)) {
                JsonNode sessionNode = rootNode.path("data").path("object");
                JsonNode metadataNode = sessionNode.path("metadata");

                String userId = metadataNode.path("userId").asText(null);
                String offerId = metadataNode.path("offerId").asText(null);

                System.out.println("==================================================");
                System.out.println("📩 [WEBHOOK CHECKOUT COMPLETED]");
                System.out.println("👉 Wyciągnięte userId: " + userId);
                System.out.println("👉 Wyciągnięte offerId: " + offerId);
                System.out.println("==================================================");

                if (userId != null && !userId.isBlank() && offerId != null && !offerId.isBlank()) {
                    packageService.fulfillOrder(userId, offerId);
                } else {
                    log.warn("⚠️ Brak metadanych userId lub offerId w odebranym Checkout Session!");
                }
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("❌ Błąd przetwarzania Webhooka Stripe: ", e);
            return ResponseEntity.badRequest().body("Błąd przetwarzania");
        }
    }
}