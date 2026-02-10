import { Component, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-enter">
      <div class="page-title">
        <h2><i class="bi bi-gift-fill"></i> Support PetsCape</h2>
        <p>Your donation helps us care for animals and keep them safe</p>
      </div>

      <div class="donate-grid">
        <!-- Amounts -->
        <div class="glass-card donate-card">
          <h3>Choose a donation amount</h3>
          <div class="amount-presets">
            @for (preset of presets; track preset) {
              <button class="amount-btn" [class.selected]="amount() === preset" (click)="amount.set(preset)">
                {{ formatAmount(preset) }}
              </button>
            }
          </div>
          <div class="custom-amount">
            <label>Or enter custom amount (USD)</label>
            <div class="input-wrap">
              <span class="currency-symbol">$</span>
              <input type="number" [(ngModel)]="customAmount" class="form-control custom-input" placeholder="e.g. 25"
                     (input)="onCustomAmount()" min="1" />
            </div>
          </div>
          <div class="total-display">
            <span>Donation amount:</span>
            <span class="total-amount">{{ formatAmount(amount()) }}</span>
          </div>
          <button class="btn-accent w-full" (click)="donate()" [disabled]="loading() || amount() <= 0">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2"></span> Processing...
            } @else {
              <i class="bi bi-credit-card"></i> Donate {{ formatAmount(amount()) }} via Stripe
            }
          </button>
          <p class="secure-hint"><i class="bi bi-shield-check"></i> Secured by Stripe — we never store your card details</p>
        </div>

        <!-- Impact -->
        <div class="glass-card impact-card">
          <h3>Your Impact</h3>
          <div class="impact-list">
            <div class="impact-item">
              <div class="impact-icon"><i class="bi bi-droplet-fill"></i></div>
              <div>
                <div class="impact-title">$10 provides</div>
                <p>Food &amp; water for a pet for one week</p>
              </div>
            </div>
            <div class="impact-item">
              <div class="impact-icon"><i class="bi bi-heart-pulse-fill"></i></div>
              <div>
                <div class="impact-title">$25 funds</div>
                <p>A veterinary checkup for an adopted pet</p>
              </div>
            </div>
            <div class="impact-item">
              <div class="impact-icon"><i class="bi bi-house-heart-fill"></i></div>
              <div>
                <div class="impact-title">$50 covers</div>
                <p>One month of shelter care for a rescued animal</p>
              </div>
            </div>
            <div class="impact-item">
              <div class="impact-icon"><i class="bi bi-trophy-fill"></i></div>
              <div>
                <div class="impact-title">$100 sponsors</div>
                <p>Full adoption preparation for one animal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { margin-bottom:1.5rem; }
    .page-title h2 { font-size:1.4rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.5rem; }
    .page-title h2 i { color:#f59e0b; }
    .page-title p { color:#6b7280; font-size:0.875rem; }
    .donate-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
    .donate-card, .impact-card { padding:2rem; }
    .donate-card h3, .impact-card h3 { font-size:1.05rem; font-weight:700; color:#f9fafb; margin-bottom:1.5rem; }
    .amount-presets { display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem; margin-bottom:1.5rem; }
    .amount-btn { background:rgba(31,41,55,0.8); border:1px solid rgba(255,255,255,0.08); color:#9ca3af; border-radius:0.6rem; padding:0.8rem; font-size:1.1rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
    .amount-btn:hover { border-color:#f59e0b; color:#fbbf24; }
    .amount-btn.selected { background:rgba(245,158,11,0.15); border-color:#f59e0b; color:#fbbf24; }
    .custom-amount { margin-bottom:1.5rem; }
    .custom-amount label { color:#9ca3af; font-size:0.85rem; font-weight:500; display:block; margin-bottom:0.5rem; }
    .input-wrap { position:relative; }
    .currency-symbol { position:absolute; left:0.9rem; top:50%; transform:translateY(-50%); color:#6b7280; font-weight:600; }
    .custom-input { padding-left:1.75rem !important; }
    .total-display { display:flex; justify-content:space-between; align-items:center; background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.15); border-radius:0.6rem; padding:0.75rem 1rem; margin-bottom:1.25rem; color:#9ca3af; font-size:0.9rem; }
    .total-amount { color:#fbbf24; font-size:1.5rem; font-weight:900; }
    .w-full { width:100%; justify-content:center; }
    .btn-accent:disabled { opacity:0.6; cursor:not-allowed; }
    .secure-hint { color:#4b5563; font-size:0.75rem; text-align:center; margin-top:0.75rem; display:flex; align-items:center; justify-content:center; gap:0.35rem; }
    .impact-list { display:flex; flex-direction:column; gap:1.25rem; }
    .impact-item { display:flex; align-items:flex-start; gap:1rem; }
    .impact-icon { width:42px; height:42px; border-radius:0.75rem; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); display:flex; align-items:center; justify-content:center; color:#fbbf24; font-size:1.1rem; flex-shrink:0; }
    .impact-title { color:#f9fafb; font-size:0.875rem; font-weight:600; margin-bottom:0.2rem; }
    .impact-item p { color:#6b7280; font-size:0.8rem; margin:0; }
    @media(max-width:768px) { .donate-grid { grid-template-columns:1fr; } }
  `]
})
export class DonateComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  presets = [5, 10, 25, 50, 100, 200];
  amount = signal(25);
  customAmount = '';
  loading = signal(false);

  formatAmount(val: number): string { return '$' + val; }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      const canceled = params['canceled'];

      if (sessionId) {
        this.loading.set(true);
        this.http.get<{amount: number, message: string}>(`${environment.apiUrl}/donations/success?session_id=${sessionId}`)
          .subscribe({
            next: (res) => {
               this.loading.set(false);
               this.toast.success('Thank You!', `Your donation of $${res.amount} was successful.`);
               // Remove session_id from URL
               window.history.replaceState({}, '', '/dashboard/donate');
            },
            error: (e) => {
               this.loading.set(false);
               this.toast.error('Donation Error', e.error?.message || 'Verification failed');
            }
          });
      } else if (canceled) {
         this.toast.error('Cancelled', 'Your donation was canceled.');
         window.history.replaceState({}, '', '/dashboard/donate');
      }
    });
  }

  onCustomAmount() {
    const val = Number(this.customAmount);
    if (val > 0) this.amount.set(val);
  }

  donate() {
    if (this.amount() <= 0) return;
    this.loading.set(true);

    // Open a blank tab synchronously to bypass popup blockers
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.body.innerHTML = '<div style="font-family: sans-serif; padding: 2rem; text-align: center;">Redirecting to secure Stripe Checkout...</div>';
    }

    this.http.post<{ checkoutUrl: string }>(`${environment.apiUrl}/donations/checkout`, { 
      amount: this.amount(),
      clientBaseUrl: window.location.origin
    }).subscribe({
      next: res => { 
        this.loading.set(false);
        if (newTab) {
          newTab.location.href = res.checkoutUrl;
        } else {
          // Fallback if popup blocker still caught it
          window.location.href = res.checkoutUrl;
        }
      },
      error: (e) => { 
        this.loading.set(false); 
        if (newTab) newTab.close();
        this.toast.error('Payment error', e.error?.message ?? 'Could not start checkout.'); 
      }
    });
  }
}
