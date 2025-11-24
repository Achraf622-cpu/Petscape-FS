package com.petscape.dto;

import com.petscape.entity.User;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String firstname;
    private String lastname;
    private String email;
    private String role;
    private String phone;
    private boolean emailVerified;
    private boolean banned;
    private String banReason;
    private String banComment;
    private LocalDateTime bannedAt;
    private LocalDateTime bannedUntil;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .emailVerified(user.getEmailVerifiedAt() != null)
                .banned(user.isCurrentlyBanned())
                .banReason(user.getBanReason() != null ? user.getBanReason().name() : null)
                .banComment(user.getBanComment())
                .bannedAt(user.getBannedAt())
                .bannedUntil(user.getBannedUntil())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
