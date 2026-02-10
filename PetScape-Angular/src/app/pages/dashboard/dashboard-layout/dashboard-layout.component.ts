import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="user-avatar">{{ initials() }}</div>
          <div>
            <div class="user-name">{{ fullName() }}</div>
            <div class="user-role">{{ role() }}</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard/profile" routerLinkActive="active">
            <i class="bi bi-person-fill"></i> Profile
          </a>
          <a routerLink="/dashboard/adoptions" routerLinkActive="active">
            <i class="bi bi-heart-fill"></i> My Adoptions
          </a>
          <a routerLink="/dashboard/appointments" routerLinkActive="active">
            <i class="bi bi-calendar-fill"></i> Appointments
          </a>
          <a routerLink="/dashboard/reports" routerLinkActive="active">
            <i class="bi bi-megaphone-fill"></i> My Reports
          </a>
          <a routerLink="/dashboard/notifications" routerLinkActive="active">
            <i class="bi bi-bell-fill"></i> Notifications
          </a>
          <a routerLink="/dashboard/donate" routerLinkActive="active">
            <i class="bi bi-gift-fill"></i> Donate
          </a>
          <hr class="sidebar-divider" />
          <a routerLink="/animals" class="browse-link">
            <i class="bi bi-search"></i> Browse Pets
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="dashboard-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { display:grid; grid-template-columns:260px 1fr; min-height:calc(100vh - 70px); }
    .sidebar { background:#1a2332; border-right:1px solid rgba(255,255,255,0.05); padding:1.5rem 1rem; display:flex; flex-direction:column; gap:0; position:sticky; top:70px; height:calc(100vh - 70px); overflow-y:auto; }
    .sidebar-header { display:flex; align-items:center; gap:0.75rem; padding:0.5rem; margin-bottom:1.5rem; }
    .user-avatar { width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,#0f766e,#14b8a6); display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:700; color:white; flex-shrink:0; }
    .user-name { font-size:0.9rem; font-weight:600; color:#f9fafb; }
    .user-role { font-size:0.75rem; color:#14b8a6; font-weight:500; text-transform:uppercase; letter-spacing:0.05em; }
    .sidebar-nav { display:flex; flex-direction:column; gap:0.25rem; }
    .sidebar-nav a { display:flex; align-items:center; gap:0.65rem; padding:0.65rem 0.85rem; border-radius:0.6rem; text-decoration:none; color:#6b7280; font-size:0.875rem; font-weight:500; transition:all 0.2s; }
    .sidebar-nav a:hover { color:#f9fafb; background:rgba(255,255,255,0.05); }
    .sidebar-nav a.active { color:#14b8a6; background:rgba(20,184,166,0.1); }
    .sidebar-nav a i { font-size:1rem; width:18px; }
    .sidebar-divider { border-color:rgba(255,255,255,0.06); margin:0.75rem 0; }
    .browse-link { color:#9ca3af !important; }
    .dashboard-main { padding:2rem; background:#111827; overflow:auto; }
    @media(max-width:900px) { .dashboard-layout { grid-template-columns:1fr; } .sidebar { display:none; } }
  `]
})
export class DashboardLayoutComponent {
  private auth = inject(AuthService);
  readonly fullName = () => `${this.auth.currentUser()?.firstname ?? ''} ${this.auth.currentUser()?.lastname ?? ''}`.trim();
  readonly initials = () => {
    const u = this.auth.currentUser();
    return `${u?.firstname?.[0]??''}${u?.lastname?.[0]??''}`.toUpperCase();
  };
  readonly role = () => this.auth.currentUser()?.role ?? 'USER';
}
