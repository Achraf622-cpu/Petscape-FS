package com.petscape.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // prevent serialization issues (lazy loading / recursion) when returning notifications
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationType type = NotificationType.GENERAL;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    @JsonProperty("isRead") // expose as isRead in REST JSON to match Angular model
    private boolean read = false;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NotificationType {
        ADOPTION_APPROVED,
        ADOPTION_REJECTED,
        APPOINTMENT_REQUESTED,
        APPOINTMENT_CONFIRMED,
        APPOINTMENT_CANCELLED,
        REPORT_RESOLVED,
        GENERAL
    }
}
