import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="verify-page">
      <div class="verify-card glass-card">
        @if (loading()) {
          <div class="state-icon loading"><span class="spinner-border" style="color:#14b8a6;"></span></div>
          <h2>Verifying your email...</h2>
        } @else if (success()) {
          <div class="state-icon success"><i class="bi bi-patch-check-fill"></i></div>
          <h2>Email Verified!</h2>
          <p>Your account has been activated. You can now sign in and start adopting!</p>
          <a routerLink="/auth/login" class="btn-primary">Sign In Now</a>
        } @else {
          <div class="state-icon error"><i class="bi bi-x-octagon-fill"></i></div>
          <h2>Verification Failed</h2>
          <p>{{ errorMsg() }}</p>
          <a routerLink="/auth/register" class="btn-outline">Register Again</a>
        }
      </div>
    </div>
  `,
  styles: [`
    .verify-page { min-height:80vh; display:flex; align-items:center; justify-content:center; padding:2rem; }
    .verify-card { max-width:440px; width:100%; padding:3rem; text-align:center; animation:fadeIn 0.4s ease; }
    .state-icon { font-size:4rem; margin-bottom:1.5rem; }
    .success { color:#34d399; }
    .error { color:#f87171; }
    h2 { font-size:1.75rem; font-weight:800; color:#f9fafb; margin-bottom:0.75rem; }
    p { color:#6b7280; line-height:1.7; margin-bottom:1.5rem; }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  loading = signal(true);
  success = signal(false);
  errorMsg = signal('');

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    this.http.get(`${environment.apiUrl}/auth/verify-email/${token}`).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); },
      error: (e) => {
        this.loading.set(false);
        this.errorMsg.set(e.error?.message ?? 'Invalid or expired verification link.');
      }
    });
  }
}
