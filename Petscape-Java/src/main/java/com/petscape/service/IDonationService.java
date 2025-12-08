package com.petscape.service;

import com.petscape.entity.User;

import java.math.BigDecimal;
import java.util.Map;

public interface IDonationService {
    String createCheckoutSession(BigDecimal amount, User currentUser, String clientBaseUrl);

    Map<String, Object> handleSuccess(String sessionId);
}
