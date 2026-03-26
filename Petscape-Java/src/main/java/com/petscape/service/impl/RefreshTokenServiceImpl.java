package com.petscape.service.impl;

import com.petscape.entity.RefreshToken;
import com.petscape.entity.User;
import com.petscape.exception.BadRequestException;
import com.petscape.repository.RefreshTokenRepository;
import com.petscape.service.IRefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements IRefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.refresh-token.expiration-days:7}")
    private int expirationDays;

    @Override
    @Transactional
    public RefreshToken createToken(User user) {

        refreshTokenRepository.revokeAllByUserId(user.getId());

        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiresAt(LocalDateTime.now().plusDays(expirationDays))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(token);
    }

    @Override
    @Transactional
    public RefreshToken validateAndRotate(String rawToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (!stored.isValid()) {

            refreshTokenRepository.revokeAllByUserId(stored.getUser().getId());
            throw new BadRequestException("Refresh token has expired or been revoked. Please log in again.");
        }


        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return stored;
    }

    @Override
    @Transactional
    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }
}
