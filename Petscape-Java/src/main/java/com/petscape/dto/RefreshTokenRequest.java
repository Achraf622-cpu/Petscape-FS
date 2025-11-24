package com.petscape.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for POST /api/auth/refresh and POST /api/auth/logout
 */
public record RefreshTokenRequest(
        @NotBlank(message = "Refresh token is required") String refreshToken) {
}
