import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Public ──
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'animals',
    loadComponent: () =>
      import('./pages/animals/animals-list/animals-list.component').then(
        (m) => m.AnimalsListComponent,
      ),
  },
  {
    path: 'animals/:id',
    loadComponent: () =>
      import('./pages/animals/animal-detail/animal-detail.component').then(
        (m) => m.AnimalDetailComponent,
      ),
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/stats/stats.component').then((m) => m.StatsComponent),
  },
  {
    path: 'quiz',
    loadComponent: () => import('./pages/quiz/quiz.component').then((m) => m.QuizComponent),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports-list/reports-list.component').then(
        (m) => m.ReportsListComponent,
      ),
  },
  {
    path: 'reports/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/reports/create-report/create-report.component').then(
        (m) => m.CreateReportComponent,
      ),
  },
  {
    path: 'reports/:id',
    loadComponent: () =>
      import('./pages/reports/report-detail/report-detail.component').then(
        (m) => m.ReportDetailComponent,
      ),
  },
  // ── Stripe redirect (public — no auth needed) ──
  {
    path: 'donate/success',
    loadComponent: () =>
      import('./pages/donate-success/donation-success.component').then(
        (m) => m.DonationSuccessComponent,
      ),
  },
  {
    path: 'donate/cancel',
    loadComponent: () =>
      import('./pages/donate-success/donation-success.component').then(
        (m) => m.DonationSuccessComponent,
      ),
  },

  // ── Auth ──
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'verify/:token',
        loadComponent: () =>
          import('./pages/auth/verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent,
          ),
      },
    ],
  },

  // ── User Dashboard ──
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/dashboard/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'adoptions',
        loadComponent: () =>
          import('./pages/dashboard/my-adoptions/my-adoptions.component').then(
            (m) => m.MyAdoptionsComponent,
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./pages/dashboard/my-appointments/my-appointments.component').then(
            (m) => m.MyAppointmentsComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/dashboard/my-reports/my-reports.component').then(
            (m) => m.MyReportsComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/dashboard/notifications/notifications.component').then(
            (m) => m.NotificationsComponent,
          ),
      },
      {
        path: 'donate',
        loadComponent: () =>
          import('./pages/dashboard/donate/donate.component').then((m) => m.DonateComponent),
      },
    ],
  },

  // ── Admin Panel ──
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'animals',
        loadComponent: () =>
          import('./pages/admin/admin-animals/admin-animals.component').then(
            (m) => m.AdminAnimalsComponent,
          ),
      },
      {
        path: 'adoptions',
        loadComponent: () =>
          import('./pages/admin/admin-adoptions/admin-adoptions.component').then(
            (m) => m.AdminAdoptionsComponent,
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./pages/admin/admin-appointments/admin-appointments.component').then(
            (m) => m.AdminAppointmentsComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/admin-users/admin-users.component').then(
            (m) => m.AdminUsersComponent,
          ),
      },
      {
        path: 'donations',
        loadComponent: () =>
          import('./pages/admin/admin-donations/admin-donations.component').then(
            (m) => m.AdminDonationsComponent,
          ),
      },
      {
        path: 'audit-logs',
        loadComponent: () =>
          import('./pages/admin/admin-audit-logs/admin-audit-logs.component').then(
            (m) => m.AdminAuditLogsComponent,
          ),
      },
    ],
  },

  // ── 404 ──
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
