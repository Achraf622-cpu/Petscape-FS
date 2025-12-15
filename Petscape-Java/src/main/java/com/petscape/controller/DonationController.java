package com.petscape.controller;

import com.petscape.dto.DonationRequest;
import com.petscape.entity.User;
import com.petscape.service.IDonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@Tag(name = "Donations", description = "Stripe-powered donation processing")
public class DonationController {

    private final IDonationService donationService;

    @PostMapping("/checkout")
    @Operation(summary = "Create a Stripe Checkout session — returns the redirect URL")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, String>> createCheckout(
            @Valid @RequestBody DonationRequest request,
            @AuthenticationPrincipal User currentUser) {
        String checkoutUrl = donationService.createCheckoutSession(request.amount(), currentUser,
                request.clientBaseUrl());
        return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
    }

    /**
     * Stripe redirects the browser here after a successful payment (plain GET, no
     * JWT).
     * We identify the donor from the userId stored in the Stripe session metadata.
     * This endpoint is public — no auth required.
     */
    @GetMapping("/success")
    @Operation(summary = "Handle Stripe success callback (public — no JWT needed)")
    public ResponseEntity<Map<String, Object>> success(
            @RequestParam("session_id") String sessionId) {
        return ResponseEntity.ok(donationService.handleSuccess(sessionId));
    }

    @GetMapping("/cancel")
    @Operation(summary = "Handle Stripe cancel redirect (public)")
    public ResponseEntity<Map<String, String>> cancel() {
        return ResponseEntity.ok(Map.of("message", "Donation cancelled"));
    }
}
