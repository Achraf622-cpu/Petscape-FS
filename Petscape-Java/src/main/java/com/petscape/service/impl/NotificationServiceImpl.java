package com.petscape.service.impl;

import com.petscape.entity.Notification;
import com.petscape.entity.Notification.NotificationType;
import com.petscape.entity.User;
import com.petscape.exception.ForbiddenException;
import com.petscape.exception.ResourceNotFoundException;
import com.petscape.repository.NotificationRepository;
import com.petscape.repository.UserRepository;
import com.petscape.service.INotificationService;
import com.petscape.service.WebSocketPushService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final WebSocketPushService wsPushService;

    @Override
    @Transactional
    public Notification createFor(Long userId, String title, String message, NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Push in real-time to the user's WebSocket session (fire-and-forget)
        wsPushService.pushNotification(user.getEmail(), saved);
        return saved;
    }

    @Override
    public Page<Notification> getForUser(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You cannot mark another user's notification as read");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }
}
