import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-donation-success',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './donation-success.component.html',
  styleUrl: './donation-success.component.css',
})
export class DonationSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  loading = signal(true);
  error = signal('');
  donationAmount = '';

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
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

      this.http
        .get<{
          amount: number;
          message: string;
        }>(`${environment.apiUrl}/donations/success?session_id=${sessionId}`)
        .subscribe({
          next: (res) => {
            this.loading.set(false);
            this.donationAmount = `€${res.amount}`;
          },
          error: (e) => {
            this.loading.set(false);
            this.error.set(e.error?.message || 'Could not verify your donation.');
          },
        });
    });
  }

  closeTab(): void {
    window.close();
  }
}
