package com.petscape.service.impl;

import com.petscape.dto.AuthResponse;
import com.petscape.dto.LoginRequest;
import com.petscape.dto.RegisterRequest;
import com.petscape.entity.RefreshToken;
import com.petscape.entity.User;
import com.petscape.exception.BadRequestException;
import com.petscape.exception.ResourceNotFoundException;
import com.petscape.repository.UserRepository;
import com.petscape.security.JwtUtil;
import com.petscape.service.IAuthService;
import com.petscape.service.IRefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;
    private final IRefreshTokenService refreshTokenService;

    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getPasswordConfirmation())) {
            throw new BadRequestException("Passwords do not match");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }
        String verificationToken = UUID.randomUUID().toString();
        User user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .emailVerificationToken(verificationToken)
                .build();
        userRepository.save(user);
        sendVerificationEmail(user, verificationToken);

        // Issue both tokens on register so the frontend is immediately usable
        RefreshToken refreshToken = refreshTokenService.createToken(user);
        return buildAuthResponse(user, jwtUtil.generateToken(user), refreshToken.getToken());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User userRecord = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (userRecord != null && userRecord.isCurrentlyBanned()) {
            String reason = userRecord.getBanReason() != null ? userRecord.getBanReason().name() : "Unspecified";
            String duration = userRecord.getBannedUntil() != null ? "until " + userRecord.getBannedUntil().toLocalDate()
                    : "permanently";
            throw new BadRequestException("You were banned " + duration + " for " + reason
                    + " talk to an admin for further information admin@petscape.com");
        }

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = (User) auth.getPrincipal();
        RefreshToken refreshToken = refreshTokenService.createToken(user);
        return buildAuthResponse(user, jwtUtil.generateToken(user), refreshToken.getToken());
    }

    @Override
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired verification token"));
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setEmailVerificationToken(null);
        userRepository.save(user);
    }

    @Override
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email"));
        if (user.getEmailVerifiedAt() != null) {
            throw new BadRequestException("Email is already verified");
        }
        // Generate a fresh token and resend
        String newToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(newToken);
        userRepository.save(user);
        sendVerificationEmail(user, newToken);
    }

    @Override
    public AuthResponse refresh(String rawRefreshToken) {
        // Validate + rotate: old token is revoked, user is extracted
        RefreshToken oldToken = refreshTokenService.validateAndRotate(rawRefreshToken);
        User user = oldToken.getUser();

        // Issue a new access token + new refresh token
        RefreshToken newRefreshToken = refreshTokenService.createToken(user);
        return buildAuthResponse(user, jwtUtil.generateToken(user), newRefreshToken.getToken());
    }

    @Override
    public void logout(String rawRefreshToken) {
        // Best-effort: if token is not found, we still consider the logout successful
        try {
            RefreshToken token = refreshTokenService.validateAndRotate(rawRefreshToken);
            refreshTokenService.revokeAllForUser(token.getUser().getId());
        } catch (BadRequestException e) {
            log.info("Logout called with invalid/expired refresh token — treating as logged-out already");
        }
    }

    // ─── Private Helpers ────────────────────────────────────────────────────────

    private void sendVerificationEmail(User user, String token) {
        try {
            String link = baseUrl + "/auth/verify/" + token;
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(user.getEmail());
            msg.setSubject("Verify your PetsCape account");
            msg.setText("Hello " + user.getFirstname() + ",\n\nClick to verify:\n" + link + "\n\nThank you!");
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Could not send verification email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .type("Bearer")
                .id(user.getId()).email(user.getEmail())
                .firstname(user.getFirstname()).lastname(user.getLastname())
                .role(user.getRole().name())
                .emailVerified(user.getEmailVerifiedAt() != null)
                .build();
    }
}
