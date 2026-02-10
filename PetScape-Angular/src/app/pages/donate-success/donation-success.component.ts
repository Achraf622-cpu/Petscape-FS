import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-donation-success',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="success-page">
      <div class="success-card glass-card">
        @if (loading()) {
          <div class="loading-state">
            <span class="spinner-border spinner-border-sm"></span>
            <p>Verifying your donation...</p>
          </div>
        } @else if (error()) {
          <div class="error-state">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <h3>Something went wrong</h3>
            <p>{{ error() }}</p>
            <a routerLink="/" class="btn-primary"><i class="bi bi-house"></i> Go Home</a>
          </div>
        } @else {
          <div class="success-state">
            <div class="check-circle"><i class="bi bi-check-lg"></i></div>
            <h2>Thank You!</h2>
            <p class="amount-display">Your donation of <strong>{{ donationAmount }}</strong> has been recorded.</p>
            <p class="sub">Your generosity helps us rescue and care for animals in need.</p>
            <div class="action-btns">
              <button (click)="closeTab()" class="btn-primary"><i class="bi bi-x-circle"></i> Close Tab</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .success-page { min-height:80vh; display:flex; align-items:center; justify-content:center; padding:2rem; }
    .success-card { max-width:480px; width:100%; padding:3rem 2.5rem; text-align:center; }
    .loading-state { color:#9ca3af; display:flex; flex-direction:column; align-items:center; gap:1rem; }
    .error-state { color:#f87171; }
    .error-state i { font-size:3rem; margin-bottom:1rem; }
    .error-state h3 { color:#f9fafb; margin-bottom:0.5rem; }
    .error-state p { color:#6b7280; margin-bottom:1.5rem; }
    .success-state {}
    .check-circle { width:80px; height:80px; border-radius:50%; background:rgba(34,197,94,0.15); border:2px solid #22c55e; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; }
    .check-circle i { font-size:2.5rem; color:#22c55e; }
    h2 { color:#f9fafb; font-size:1.8rem; font-weight:800; margin-bottom:0.75rem; }
    .amount-display { color:#d1d5db; font-size:1.1rem; margin-bottom:0.5rem; }
    .amount-display strong { color:#22c55e; }
    .sub { color:#6b7280; font-size:0.9rem; margin-bottom:2rem; }
    .action-btns { display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; }
  `]
})
export class DonationSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  loading = signal(true);
  error = signal('');
  donationAmount = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      const canceled = params['canceled'];

      if (canceled) {
        this.loading.set(false);
        this.error.set('Your donation was cancelled.');
        return;
      }

      if (!sessionId) {
        this.loading.set(false);
        this.error.set('No session found. Please try donating again.');
        return;
      }

      this.http.get<{ amount: number; message: string }>(
        `${environment.apiUrl}/donations/success?session_id=${sessionId}`
      ).subscribe({
        next: (res) => {
          this.loading.set(false);
          this.donationAmount = `€${res.amount}`;
        },
        error: (e) => {
          this.loading.set(false);
          this.error.set(e.error?.message || 'Could not verify your donation.');
        }
      });
    });
  }

  closeTab(): void {
    window.close();
  }
}
