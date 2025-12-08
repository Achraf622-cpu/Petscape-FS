package com.petscape.service;

import com.petscape.entity.RefreshToken;
import com.petscape.entity.User;

public interface IRefreshTokenService {
    RefreshToken createToken(User user);

    RefreshToken validateAndRotate(String rawToken);

    void revokeAllForUser(Long userId);
}
