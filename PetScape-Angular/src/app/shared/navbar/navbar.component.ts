import { Component, inject, computed, signal, HostListener, effect, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { WebSocketService } from '../../core/services/websocket.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  private auth = inject(AuthService);
  private notifService = inject(NotificationService);
  readonly wsSvc = inject(WebSocketService);

  readonly isLoggedIn = this.auth.isAuthenticated;
  readonly isAdmin = this.auth.isAdmin;
  readonly unreadCount = this.notifService.unreadCount;
  /** Live WS notifications received this session */
  readonly wsCount = this.wsSvc.unreadCount;
  /** Combined badge = DB unread + WS push received this session */
  readonly totalUnread = computed(() => this.unreadCount() + this.wsCount());
  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);
  readonly mobileOpen = signal(false);

  readonly firstName = computed(() => this.auth.currentUser()?.firstname ?? '');
  readonly initials = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return '';
    return `${u.firstname?.[0] ?? ''}${u.lastname?.[0] ?? ''}`.toUpperCase();
  });

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (!(e.target as Element).closest('.user-menu')) this.menuOpen.set(false);
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }
  closeMenu() {
    this.menuOpen.set(false);
  }
  toggleMobile() {
    this.mobileOpen.update((v) => !v);
  }
  closeMobile() {
    this.mobileOpen.set(false);
  }
  logout() {
    this.auth.logout();
    this.wsSvc.disconnect();
    this.closeMenu();
    this.closeMobile();
  }

  async ngOnInit() {
    await this.auth.ready;
    if (this.isLoggedIn()) {
      this.notifService.getUnreadCount().subscribe({ error: () => {} });
      // Auto-connect WebSocket using the stored JWT
      const token = this.auth.getToken();
      if (token) this.wsSvc.connect(token);
    }
  }
}
