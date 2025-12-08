package com.petscape.service;

import com.petscape.dto.AuthResponse;
import com.petscape.dto.LoginRequest;
import com.petscape.dto.RegisterRequest;

public interface IAuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void verifyEmail(String token);

    void resendVerification(String email);

    AuthResponse refresh(String refreshToken);

    void logout(String refreshToken);
}
