package com.petscape.service;

import com.petscape.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Pushes real-time notifications to connected WebSocket clients.
 *
 * Each user subscribes to: /user/queue/notifications
 * We send to the user by their email (Spring Security principal name).
 *
 * The payload is a compact map so the Angular client can handle it without a
 * full DTO.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketPushService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Pushes a notification to the connected WebSocket session of a specific user.
     * If the user is not connected, the message is silently dropped
     * (fire-and-forget).
     *
     * @param userEmail    the Spring Security principal name (email) of the
     *                     recipient
     * @param notification the saved Notification entity to push
     */
    public void pushNotification(String userEmail, Notification notification) {
        try {
            Map<String, Object> payload = Map.of(
                    "id", notification.getId(),
                    "title", notification.getTitle(),
                    "message", notification.getMessage(),
                    "type", notification.getType().name(),
                    "read", notification.isRead(),
                    "createdAt", notification.getCreatedAt().toString());

            messagingTemplate.convertAndSendToUser(
                    userEmail,
                    "/queue/notifications",
                    payload);
            log.debug("Pushed WebSocket notification to user {}: {}", userEmail, notification.getTitle());
        } catch (Exception e) {
            // Non-critical — DB notification was already saved, just log the push failure
            log.warn("Failed to push WebSocket notification to {}: {}", userEmail, e.getMessage());
        }
    }
}
