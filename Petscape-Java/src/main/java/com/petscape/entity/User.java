package com.petscape.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstname;

    @Column(nullable = false)
    private String lastname;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    private String phone;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    // ── Ban fields ──
    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean banned = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "ban_reason")
    private BanReason banReason;

    @Column(name = "ban_comment", columnDefinition = "TEXT")
    private String banComment;

    @Column(name = "banned_at")
    private LocalDateTime bannedAt;

    @Column(name = "banned_until")
    private LocalDateTime bannedUntil; // null = permanent

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Spring Security Methods ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Account is locked if banned permanently or ban hasn't expired
        if (!banned)
            return true;
        if (bannedUntil == null)
            return false; // permanent ban
        return LocalDateTime.now().isAfter(bannedUntil); // expired = unlocked
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public boolean isAdmin() {
        return Role.ADMIN.equals(this.role);
    }

    /**
     * Check if the user is currently banned (respects ban expiry).
     */
    public boolean isCurrentlyBanned() {
        if (!banned)
            return false;
        if (bannedUntil == null)
            return true; // permanent
        return LocalDateTime.now().isBefore(bannedUntil);
    }

    public enum Role {
        USER, ADMIN
    }

    public enum BanReason {
        SPAM,
        ABUSE,
        FRAUD,
        INAPPROPRIATE_CONTENT,
        FAKE_REPORTS,
        OTHER
    }
}
