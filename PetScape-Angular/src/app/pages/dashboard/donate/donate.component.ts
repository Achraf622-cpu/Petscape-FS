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
  templateUrl: './donate.component.html',
  styleUrl: './donate.component.css',
})
export class DonateComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  presets = [5, 10, 25, 50, 100, 200];
  amount = signal(25);
  customAmount = '';
  loading = signal(false);

  formatAmount(val: number): string {
    return '$' + val;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const sessionId = params['session_id'];
      const canceled = params['canceled'];

      if (sessionId) {
        this.loading.set(true);
        this.http
          .get<{
            amount: number;
            message: string;
          }>(`${environment.apiUrl}/donations/success?session_id=${sessionId}`)
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
            },
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
      newTab.document.body.innerHTML =
        '<div style="font-family: sans-serif; padding: 2rem; text-align: center;">Redirecting to secure Stripe Checkout...</div>';
    }

    this.http
      .post<{ checkoutUrl: string }>(`${environment.apiUrl}/donations/checkout`, {
        amount: this.amount(),
        clientBaseUrl: window.location.origin,
      })
      .subscribe({
        next: (res) => {
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
        },
      });
  }
}
