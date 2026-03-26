package com.petscape.service.impl;

import com.petscape.entity.Donation;
import com.petscape.entity.Donation.DonationStatus;
import com.petscape.entity.User;
import com.petscape.exception.BadRequestException;
import com.petscape.repository.DonationRepository;
import com.petscape.repository.UserRepository;
import com.petscape.service.IDonationService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DonationServiceImpl implements IDonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;
    @Value("${stripe.success-url}")
    private String successUrl;
    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    @Override
    public String createCheckoutSession(BigDecimal amount, User currentUser, String clientBaseUrl) {
        Stripe.apiKey = stripeSecretKey;
        String success = (clientBaseUrl != null && !clientBaseUrl.isBlank() ? clientBaseUrl
                : successUrl.replace("/donate/success", "")) + "/donate/success?session_id={CHECKOUT_SESSION_ID}";
        String cancel = (clientBaseUrl != null && !clientBaseUrl.isBlank() ? clientBaseUrl
                : cancelUrl.replace("/donate/cancel", "")) + "/donate/cancel";

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .putMetadata("userId", currentUser.getId().toString())
                    .setSuccessUrl(success)
                    .setCancelUrl(cancel)
                    .addLineItem(SessionCreateParams.LineItem.builder().setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder().setCurrency("eur")
                                    .setUnitAmount(amount.multiply(BigDecimal.valueOf(100)).longValue())
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Don pour PetsCape").build())
                                    .build())
                            .build())
                    .build();
            return Session.create(params).getUrl();
        } catch (StripeException e) {
            log.error("Stripe error: {}", e.getMessage());
            throw new BadRequestException("Payment session creation failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Map<String, Object> handleSuccess(String sessionId) {
        Stripe.apiKey = stripeSecretKey;

        if (donationRepository.findByStripeSessionId(sessionId).isPresent()) {
            log.info("Stripe session {} already processed — skipping", sessionId);
            return Map.of("message", "Donation already recorded. Thank you!");
        }
        try {
            Session session = Session.retrieve(sessionId);
            if (!"paid".equals(session.getPaymentStatus()))
                throw new BadRequestException("Payment not completed");

            String userIdStr = session.getMetadata() != null ? session.getMetadata().get("userId") : null;
            if (userIdStr == null)
                throw new BadRequestException("Session metadata missing userId");

            User donor = userRepository.findById(Long.valueOf(userIdStr))
                    .orElseThrow(() -> new BadRequestException("User not found"));

            BigDecimal amount = BigDecimal.valueOf(session.getAmountTotal()).divide(BigDecimal.valueOf(100));
            donationRepository.save(Donation.builder()
                    .user(donor).amount(amount)
                    .stripeSessionId(sessionId).status(DonationStatus.COMPLETED).build());

            Map<String, Object> result = new HashMap<>();
            result.put("amount", amount);
            result.put("message", "Thank you for your donation!");
            return result;
        } catch (StripeException e) {
            log.error("Stripe error on success: {}", e.getMessage());
            throw new BadRequestException("Failed to verify payment: " + e.getMessage());
        }
    }
}
