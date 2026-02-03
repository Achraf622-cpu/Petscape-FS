import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-logo">
          <i class="bi bi-shield-fill-check"></i> Admin Panel
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active">
            <i class="bi bi-speedometer2"></i> Dashboard
          </a>
          <a routerLink="/admin/animals" routerLinkActive="active">
            <i class="bi bi-heart-fill"></i> Animals
          </a>
          <a routerLink="/admin/adoptions" routerLinkActive="active">
            <i class="bi bi-people-fill"></i> Adoptions
          </a>
          <a routerLink="/admin/appointments" routerLinkActive="active">
            <i class="bi bi-calendar-fill"></i> Appointments
          </a>
          <a routerLink="/admin/users" routerLinkActive="active">
            <i class="bi bi-person-fill"></i> Users
          </a>
          <a routerLink="/admin/donations" routerLinkActive="active">
            <i class="bi bi-gift-fill"></i> Donations
          </a>
          <a routerLink="/admin/audit-logs" routerLinkActive="active">
            <i class="bi bi-journal-text"></i> Audit Logs
          </a>
          <hr class="divider" />
          <a routerLink="/" class="back-link">
            <i class="bi bi-arrow-left"></i> Back to Site
          </a>
        </nav>
      </aside>
      <main class="admin-main"><router-outlet /></main>
    </div>
  `,
  styles: [`
    .admin-layout { display:grid; grid-template-columns:240px 1fr; min-height:calc(100vh - 70px); }
    .admin-sidebar { background:#0d1117; border-right:1px solid rgba(255,255,255,0.05); padding:1.5rem 1rem; position:sticky; top:70px; height:calc(100vh - 70px); overflow-y:auto; }
    .sidebar-logo { display:flex; align-items:center; gap:0.6rem; color:#a78bfa; font-weight:800; font-size:1rem; padding:0.5rem; margin-bottom:1.5rem; }
    .sidebar-logo i { font-size:1.2rem; }
    .sidebar-nav { display:flex; flex-direction:column; gap:0.2rem; }
    .sidebar-nav a { display:flex; align-items:center; gap:0.65rem; padding:0.65rem 0.85rem; border-radius:0.6rem; text-decoration:none; color:#6b7280; font-size:0.875rem; font-weight:500; transition:all 0.2s; }
    .sidebar-nav a:hover { color:#f9fafb; background:rgba(255,255,255,0.04); }
    .sidebar-nav a.active { color:#a78bfa; background:rgba(139,92,246,0.1); }
    .divider { border-color:rgba(255,255,255,0.05); margin:0.75rem 0; }
    .back-link { color:#4b5563 !important; font-size:0.82rem !important; }
    .admin-main { padding:2rem; background:#111827; }
  `]
})
export class AdminLayoutComponent {}
