import { Component, OnInit, signal, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../models/models';
import { DatePipe } from '@angular/common';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit {
  private service = inject(NotificationService);
  private wsSvc = inject(WebSocketService);

  loading = signal(true);
  notifications = signal<Notification[]>([]);

  ngOnInit() {
    // When user opens the notifications page, clear WebSocket session unread count
    this.wsSvc.clearUnread();

    this.service.getAll().subscribe({
      next: (n) => {
        this.notifications.set(n);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  markRead(n: Notification) {
    if (n.isRead) return;
    this.service.markRead(n.id).subscribe(() => {
      this.notifications.update((list) =>
        list.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
      );
    });
  }

  markAll() {
    this.service.markAllRead().subscribe(() => {
      this.notifications.update((list) => list.map((x) => ({ ...x, isRead: true })));
    });
  }

  getIcon(type: string): string {
    if (!type) return 'bi bi-bell-fill';
    const base = type.toUpperCase();
    if (base.startsWith('ADOPTION')) return 'bi bi-heart-fill';
    if (base.startsWith('APPOINTMENT')) return 'bi bi-calendar-fill';
    if (base.startsWith('REPORT')) return 'bi bi-megaphone-fill';
    return 'bi bi-bell-fill';
  }

  getIconClass(type: string): string {
    if (!type) return 'icon-default';
    const base = type.toUpperCase();
    if (base.startsWith('ADOPTION')) return 'icon-adoption';
    if (base.startsWith('APPOINTMENT')) return 'icon-appointment';
    if (base.startsWith('REPORT')) return 'icon-report';
    return 'icon-default';
  }
}
