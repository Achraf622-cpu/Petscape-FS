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
  template: `
    <nav class="navbar-custom" [class.scrolled]="scrolled()">
      <div class="nav-inner">
        <!-- Logo -->
        <a routerLink="/" class="brand">
          <div class="brand-icon">
            <i class="bi bi-heart-fill"></i>
          </div>
          <span class="brand-name">PetsCape</span>
        </a>

        <!-- Desktop Nav -->
        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="/animals" routerLinkActive="active">Adopt</a></li>
          <li><a routerLink="/reports" routerLinkActive="active">Lost & Found</a></li>
          <li><a routerLink="/stats" routerLinkActive="active"><i class="bi bi-bar-chart-fill me-1"></i> Impact</a></li>
          <li><a routerLink="/quiz" routerLinkActive="active"><i class="bi bi-question-circle-fill me-1"></i> Quiz</a></li>
          @if (isLoggedIn()) {
            <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
          }
          @if (isAdmin()) {
            <li><a routerLink="/admin" routerLinkActive="active" class="admin-link">Admin</a></li>
          }
        </ul>

        <!-- Right side -->
        <div class="nav-right">
          @if (isLoggedIn()) {
            <!-- Notifications bell with live WebSocket badge -->
            <a routerLink="/dashboard/notifications" class="notif-btn" (click)="wsSvc.clearUnread()">
              <i class="bi bi-bell-fill" [class.bell-pulse]="wsCount() > 0"></i>
              @if (totalUnread() > 0) {
                <span class="notif-badge" [class.ws-badge]="wsCount() > 0">{{ totalUnread() > 9 ? '9+' : totalUnread() }}</span>
              }
              @if (wsSvc.connected()) {
                <span class="ws-dot" title="Real-time connected"></span>
              }
            </a>
            <!-- User dropdown -->
            <div class="user-menu" [class.open]="menuOpen()">
              <button class="user-btn" (click)="toggleMenu()">
                <div class="avatar">{{ initials() }}</div>
                <span class="user-name">{{ firstName() }}</span>
                <i class="bi bi-chevron-down chevron" [class.rotated]="menuOpen()"></i>
              </button>
              @if (menuOpen()) {
                <div class="dropdown-panel">
                  <a routerLink="/dashboard/profile" (click)="closeMenu()">
                    <i class="bi bi-person"></i> Profile
                  </a>
                  <a routerLink="/dashboard/adoptions" (click)="closeMenu()">
                    <i class="bi bi-heart"></i> My Adoptions
                  </a>
                  <a routerLink="/dashboard/donate" (click)="closeMenu()">
                    <i class="bi bi-gift"></i> Donate
                  </a>
                  <hr />
                  <button (click)="logout()" class="logout-btn">
                    <i class="bi bi-box-arrow-right"></i> Logout
                  </button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/auth/login" class="btn-outline-nav">Sign In</a>
            <a routerLink="/auth/register" class="btn-primary-nav">Get Started</a>
          }

          <!-- Mobile hamburger -->
          <button class="hamburger" (click)="toggleMobile()" [class.active]="mobileOpen()">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileOpen()) {
        <div class="mobile-menu">
          <a routerLink="/" (click)="closeMobile()">Home</a>
          <a routerLink="/animals" (click)="closeMobile()">Adopt a Pet</a>
          <a routerLink="/reports" (click)="closeMobile()">Lost & Found</a>
          @if (isLoggedIn()) {
            <a routerLink="/dashboard" (click)="closeMobile()">Dashboard</a>
            @if (isAdmin()) {
              <a routerLink="/admin" (click)="closeMobile()">Admin Panel</a>
            }
            <button (click)="logout()" class="mobile-logout">Logout</button>
          } @else {
            <a routerLink="/auth/login" (click)="closeMobile()">Sign In</a>
            <a routerLink="/auth/register" (click)="closeMobile()">Register</a>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar-custom {
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 0 1.5rem;
      height: 70px;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .navbar-custom.scrolled {
      background: rgba(17,24,39,0.98);
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .nav-inner { display:flex; align-items:center; gap:2rem; width:100%; max-width:1280px; margin:0 auto; }
    .brand { display:flex; align-items:center; gap:0.6rem; text-decoration:none; }
    .brand-icon { width:36px; height:36px; background:linear-gradient(135deg,#0f766e,#14b8a6); border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-size:1rem; }
    .brand-name { font-size:1.3rem; font-weight:800; background:linear-gradient(135deg,#14b8a6,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .nav-links { display:flex; list-style:none; gap:0.25rem; margin:0; padding:0; }
    .nav-links a { color:#9ca3af; text-decoration:none; padding:0.4rem 0.8rem; border-radius:0.5rem; font-size:0.9rem; font-weight:500; transition:all 0.2s; }
    .nav-links a:hover, .nav-links a.active { color:#f9fafb; background:rgba(255,255,255,0.06); }
    .admin-link.active { color:#a78bfa !important; }
    .nav-right { display:flex; align-items:center; gap:0.75rem; margin-left:auto; }
    .notif-btn { position:relative; color:#9ca3af; font-size:1.2rem; text-decoration:none; padding:0.4rem; border-radius:50%; transition:color 0.2s; }
    .notif-btn:hover { color:#14b8a6; }
    .notif-badge { position:absolute; top:-2px; right:-2px; background:#ef4444; color:white; border-radius:999px; font-size:0.65rem; font-weight:700; min-width:18px; height:18px; display:flex; align-items:center; justify-content:center; padding:0 3px; }
    .user-menu { position:relative; }
    .user-btn { display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#f9fafb; border-radius:2rem; padding:0.35rem 0.8rem 0.35rem 0.4rem; cursor:pointer; transition:all 0.2s; font-size:0.875rem; font-weight:500; }
    .user-btn:hover { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.15); }
    .avatar { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#0f766e,#14b8a6); display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:700; }
    .user-name { max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .chevron { font-size:0.7rem; transition:transform 0.2s; color:#9ca3af; }
    .chevron.rotated { transform:rotate(180deg); }
    .dropdown-panel { position:absolute; right:0; top:calc(100% + 8px); background:#1f2937; border:1px solid rgba(255,255,255,0.08); border-radius:0.75rem; padding:0.5rem; min-width:180px; box-shadow:0 8px 32px rgba(0,0,0,0.5); animation:fadeIn 0.15s ease; }
    .dropdown-panel a, .dropdown-panel .logout-btn { display:flex; align-items:center; gap:0.5rem; padding:0.5rem 0.75rem; color:#d1d5db; text-decoration:none; border-radius:0.5rem; font-size:0.875rem; transition:all 0.15s; width:100%; border:none; background:none; cursor:pointer; }
    .dropdown-panel a:hover, .dropdown-panel .logout-btn:hover { background:rgba(15,118,110,0.15); color:#14b8a6; }
    .dropdown-panel hr { border-color:rgba(255,255,255,0.08); margin:0.4rem 0; }
    .logout-btn { color:#f87171 !important; }
    .logout-btn:hover { background:rgba(239,68,68,0.1) !important; color:#f87171 !important; }
    .btn-outline-nav { color:#d1d5db; border:1px solid rgba(255,255,255,0.15); padding:0.4rem 1rem; border-radius:0.5rem; text-decoration:none; font-size:0.875rem; font-weight:500; transition:all 0.2s; }
    .btn-outline-nav:hover { border-color:#14b8a6; color:#14b8a6; }
    .btn-primary-nav { background:linear-gradient(135deg,#0f766e,#14b8a6); color:white; padding:0.4rem 1rem; border-radius:0.5rem; text-decoration:none; font-size:0.875rem; font-weight:600; transition:all 0.2s; }
    .btn-primary-nav:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(15,118,110,0.4); }
    .hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:0.5rem; }
    .hamburger span { display:block; width:22px; height:2px; background:#9ca3af; border-radius:2px; transition:all 0.3s; }
    .hamburger.active span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
    .hamburger.active span:nth-child(2) { opacity:0; }
    .hamburger.active span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
    .mobile-menu { position:absolute; top:70px; left:0; right:0; background:rgba(17,24,39,0.98); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,0.05); padding:1rem 1.5rem; display:flex; flex-direction:column; gap:0.5rem; animation:slideDown 0.25s ease; }
    .mobile-menu a, .mobile-logout { color:#d1d5db; text-decoration:none; padding:0.75rem 1rem; border-radius:0.5rem; font-size:0.95rem; transition:all 0.2s; display:block; background:none; border:none; cursor:pointer; text-align:left; width:100%; }
    .mobile-menu a:hover { background:rgba(255,255,255,0.05); color:#14b8a6; }
    .mobile-logout { color:#f87171; }
    @keyframes wsRipple { 0%{transform:scale(1);opacity:0.8;} 100%{transform:scale(2.2);opacity:0;} }
    @keyframes bellPulse { 0%,100%{transform:rotate(0);} 20%{transform:rotate(-15deg);} 40%{transform:rotate(15deg);} 60%{transform:rotate(-8deg);} 80%{transform:rotate(8deg);} }
    .bell-pulse { animation: bellPulse 0.6s ease; }
    .ws-badge { background:linear-gradient(135deg,#ef4444,#f97316) !important; box-shadow:0 0 8px rgba(239,68,68,0.6); }
    .ws-dot { position:absolute; bottom:0; right:0; width:7px; height:7px; border-radius:50%; background:#22c55e; border:1px solid #111827; }
    @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
    @media (max-width: 768px) {
      .nav-links, .btn-outline-nav, .btn-primary-nav, .notif-btn, .user-menu { display:none; }
      .hamburger { display:flex; }
    }
  `]
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
  onScroll() { this.scrolled.set(window.scrollY > 20); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (!(e.target as Element).closest('.user-menu')) this.menuOpen.set(false);
  }

  toggleMenu()  { this.menuOpen.update(v => !v); }
  closeMenu()   { this.menuOpen.set(false); }
  toggleMobile(){ this.mobileOpen.update(v => !v); }
  closeMobile() { this.mobileOpen.set(false); }
  logout()      { this.auth.logout(); this.wsSvc.disconnect(); this.closeMenu(); this.closeMobile(); }

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
