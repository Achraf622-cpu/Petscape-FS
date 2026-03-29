import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
})
export class DashboardLayoutComponent {
  private auth = inject(AuthService);
  readonly fullName = () =>
    `${this.auth.currentUser()?.firstname ?? ''} ${this.auth.currentUser()?.lastname ?? ''}`.trim();
  readonly initials = () => {
    const u = this.auth.currentUser();
    return `${u?.firstname?.[0] ?? ''}${u?.lastname?.[0] ?? ''}`.toUpperCase();
  };
  readonly role = () => this.auth.currentUser()?.role ?? 'USER';
}
