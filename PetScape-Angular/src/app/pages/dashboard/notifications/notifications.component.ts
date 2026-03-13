import { Component, OnInit, signal, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../models/models';
import { DatePipe } from '@angular/common';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-enter">
      <div class="page-title-row">
        <div>
          <h2><i class="bi bi-bell-fill"></i> Notifications</h2>
          <p>Stay updated on your adoptions and appointments</p>
        </div>
        @if (notifications().some(n => !n.isRead)) {
          <button class="btn-outline btn-sm" (click)="markAll()">
            <i class="bi bi-check2-all"></i> Mark All Read
          </button>
        }
      </div>

      @if (loading()) {
        <div class="notif-list">
          @for (i of [1,2,3,4]; track i) { <div class="skeleton" style="height:70px;border-radius:0.75rem;"></div> }
        </div>
      } @else if (notifications().length === 0) {
        <div class="empty-state">
          <i class="bi bi-bell-slash"></i>
          <h3>All caught up!</h3>
          <p>No notifications at the moment.</p>
        </div>
      } @else {
        <div class="notif-list">
          @for (n of notifications(); track n.id) {
            <div class="notif-item" [class.unread]="!n.isRead" (click)="markRead(n)">
              <div class="notif-icon" [class]="getIconClass(n.type)">
                <i [class]="getIcon(n.type)"></i>
              </div>
              <div class="notif-body">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-msg">{{ n.message }}</div>
                <div class="notif-time">{{ n.createdAt | date:'MMM d, h:mm a' }}</div>
              </div>
              @if (!n.isRead) { <div class="unread-dot"></div> }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-title-row { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
    h2 { font-size:1.4rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.5rem; }
    h2 i { color:#14b8a6; }
    p { color:#6b7280; font-size:0.875rem; }
    .btn-sm { padding:0.35rem 0.9rem !important; font-size:0.8rem !important; }
    .notif-list { display:flex; flex-direction:column; gap:0.5rem; }
    .notif-item { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; background:rgba(31,41,55,0.5); border:1px solid rgba(255,255,255,0.05); border-radius:0.75rem; cursor:pointer; transition:all 0.2s; position:relative; }
    .notif-item:hover { border-color:rgba(20,184,166,0.2); background:rgba(31,41,55,0.8); }
    .notif-item.unread { border-color:rgba(20,184,166,0.15); background:rgba(20,184,166,0.04); }
    .notif-icon { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
    .notif-body { flex:1; min-width:0; }
    .notif-title { color:#f9fafb; font-size:0.9rem; font-weight:600; margin-bottom:0.2rem; }
    .notif-msg { color:#9ca3af; font-size:0.8rem; }
    .notif-time { color:#4b5563; font-size:0.75rem; margin-top:0.3rem; }
    .unread-dot { width:8px; height:8px; border-radius:50%; background:#14b8a6; flex-shrink:0; }
    .empty-state { text-align:center; padding:4rem 2rem; }
    .empty-state i { font-size:3rem; color:#374151; display:block; margin-bottom:1rem; }
    .empty-state h3 { color:#6b7280; font-size:1.2rem; font-weight:700; margin-bottom:0.5rem; }
    /* Type icon colors */
    .icon-adoption { background:rgba(15,118,110,0.15); color:#14b8a6; }
    .icon-appointment { background:rgba(139,92,246,0.15); color:#a78bfa; }
    .icon-report { background:rgba(245,158,11,0.15); color:#fbbf24; }
    .icon-default { background:rgba(31,41,55,0.8); color:#6b7280; }
  `]
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
      next: n => { this.notifications.set(n); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  markRead(n: Notification) {
    if (n.isRead) return;
    this.service.markRead(n.id).subscribe(() => {
      this.notifications.update(list => list.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    });
  }

  markAll() {
    this.service.markAllRead().subscribe(() => {
      this.notifications.update(list => list.map(x => ({ ...x, isRead: true })));
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
