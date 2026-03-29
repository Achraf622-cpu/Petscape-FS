import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  loading = signal(false);
  showPass = signal(false);
  errorMsg = signal('');
  showResend = signal(false);
  resending = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');
    this.showResend.set(false);
    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        this.toast.success('Welcome back!', 'You are now signed in.');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        const msg: string = err.error?.message ?? 'Invalid email or password';
        this.errorMsg.set(msg);
        // Show resend button if the error mentions email verification
        if (msg.toLowerCase().includes('verif') || msg.toLowerCase().includes('not verified')) {
          this.showResend.set(true);
        }
      },
    });
  }

  resendVerification() {
    const email = this.form.get('email')?.value;
    if (!email) {
      this.toast.error('Error', 'Please enter your email first.');
      return;
    }
    this.resending.set(true);
    this.http
      .post<{ message: string }>(`${environment.apiUrl}/auth/resend-verification`, { email })
      .subscribe({
        next: (res) => {
          this.resending.set(false);
          this.toast.success('Email Sent', res.message);
          this.showResend.set(false);
        },
        error: (e) => {
          this.resending.set(false);
          this.toast.error('Error', e.error?.message || 'Could not resend verification email.');
        },
      });
  }
}
