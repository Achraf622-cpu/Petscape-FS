import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
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
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (e) => {
        this.loading.set(false);
        this.errorMsg.set(e.error?.message ?? 'Invalid or expired verification link.');
      },
    });
  }
}
