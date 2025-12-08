package com.petscape.service;

import com.petscape.entity.Notification;
import com.petscape.entity.Notification.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface INotificationService {
    Notification createFor(Long userId, String title, String message, NotificationType type);

    Page<Notification> getForUser(Long userId, Pageable pageable);

    long getUnreadCount(Long userId);

    Notification markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);
}
