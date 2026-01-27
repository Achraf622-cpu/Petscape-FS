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
  template: `
    <div class="auth-layout">
      <!-- Left Panel -->
      <div class="auth-left">
        <div class="auth-brand">
          <div class="brand-icon"><i class="bi bi-heart-fill"></i></div>
          <span>PetsCape</span>
        </div>
        <div class="auth-illustration">
          <div class="illustration-circle">
            <i class="bi bi-heart-fill"></i>
          </div>
          <div class="float-badge badge1"><i class="bi bi-check-circle-fill"></i> Secure Login</div>
          <div class="float-badge badge2"><i class="bi bi-shield-check"></i> JWT Protected</div>
        </div>
        <h2>Welcome Back!</h2>
        <p>Sign in to manage your adoptions, appointments, and help reunite lost pets with their families.</p>
      </div>

      <!-- Right Panel (Form) -->
      <div class="auth-right">
        <div class="auth-card">
          <h1>Sign In</h1>
          <p class="auth-subtitle">Don't have an account? <a routerLink="/auth/register" class="link-primary">Create one</a></p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field">
              <label>Email</label>
              <div class="input-wrap">
                <i class="bi bi-envelope input-icon"></i>
                <input type="email" formControlName="email" class="form-control" placeholder="you@example.com" />
              </div>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <span class="field-error">Valid email required</span>
              }
            </div>

            <div class="field">
              <label>Password</label>
              <div class="input-wrap">
                <i class="bi bi-lock input-icon"></i>
                <input [type]="showPass() ? 'text' : 'password'" formControlName="password" class="form-control" placeholder="Enter your password" />
                <button type="button" class="pass-toggle" (click)="showPass.update(v => !v)">
                  <i [class]="showPass() ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <span class="field-error">Password required</span>
              }
            </div>

            @if (errorMsg()) {
              <div class="auth-error">
                <i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg() }}
              </div>
              @if (showResend()) {
                <button type="button" class="resend-btn" (click)="resendVerification()" [disabled]="resending()">
                  @if (resending()) {
                    <span class="spinner-border spinner-border-sm me-1"></span> Sending...
                  } @else {
                    <i class="bi bi-envelope-arrow-up"></i> Resend Verification Email
                  }
                </button>
              }
            }

            <button type="submit" class="btn-primary w-full" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner-border spinner-border-sm me-2"></span> Signing in...
              } @else {
                <i class="bi bi-box-arrow-in-right"></i> Sign In
              }
            </button>
          </form>

          <p class="auth-demo-hint">
            <i class="bi bi-info-circle"></i> Demo admin: <strong>admin&#64;petscape.com</strong>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
    .auth-left { background:linear-gradient(160deg,#0d1117 0%,#0f2e2b 50%,#111827 100%); display:flex; flex-direction:column; justify-content:center; align-items:center; padding:3rem; text-align:center; position:relative; overflow:hidden; }
    .auth-left::before { content:''; position:absolute; width:400px; height:400px; border-radius:50%; background:rgba(15,118,110,0.08); left:-100px; top:50%; transform:translateY(-50%); }
    .auth-brand { display:flex; align-items:center; gap:0.6rem; margin-bottom:3rem; position:relative; }
    .auth-brand .brand-icon { width:40px; height:40px; background:linear-gradient(135deg,#0f766e,#14b8a6); border-radius:12px; display:flex; align-items:center; justify-content:center; color:white; font-size:1.1rem; }
    .auth-brand span { font-size:1.5rem; font-weight:800; background:linear-gradient(135deg,#14b8a6,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .auth-illustration { position:relative; margin-bottom:2rem; }
    .illustration-circle { width:160px; height:160px; border-radius:50%; background:linear-gradient(135deg,rgba(15,118,110,0.2),rgba(20,184,166,0.1)); border:2px solid rgba(20,184,166,0.2); display:flex; align-items:center; justify-content:center; font-size:4rem; color:#14b8a6; margin:0 auto; animation:pulse 3s ease infinite; }
    .float-badge { position:absolute; background:rgba(31,41,55,0.9); border:1px solid rgba(255,255,255,0.1); border-radius:999px; padding:0.4rem 0.9rem; font-size:0.8rem; color:#d1d5db; white-space:nowrap; }
    .badge1 { bottom:0; left:-10px; animation:float 3s ease-in-out infinite; }
    .badge2 { top:10px; right:-10px; animation:float 3s ease-in-out infinite 1.5s; }
    @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
    .auth-left h2 { font-size:1.75rem; font-weight:800; color:#f9fafb; margin-bottom:0.75rem; position:relative; }
    .auth-left p { color:#6b7280; line-height:1.7; max-width:320px; position:relative; }
    .auth-right { display:flex; align-items:center; justify-content:center; padding:2rem; background:#111827; }
    .auth-card { width:100%; max-width:420px; animation:fadeIn 0.4s ease; }
    .auth-card h1 { font-size:2rem; font-weight:800; color:#f9fafb; margin-bottom:0.25rem; }
    .auth-subtitle { color:#6b7280; font-size:0.9rem; margin-bottom:2rem; }
    .auth-form { display:flex; flex-direction:column; gap:1.25rem; }
    .field { display:flex; flex-direction:column; gap:0.4rem; }
    .field label { color:#9ca3af; font-size:0.875rem; font-weight:500; }
    .input-wrap { position:relative; }
    .input-icon { position:absolute; left:0.9rem; top:50%; transform:translateY(-50%); color:#4b5563; font-size:0.9rem; pointer-events:none; }
    .form-control { padding-left:2.5rem !important; }
    .pass-toggle { position:absolute; right:0.9rem; top:50%; transform:translateY(-50%); background:none; border:none; color:#4b5563; cursor:pointer; font-size:0.9rem; padding:0; transition:color 0.2s; }
    .pass-toggle:hover { color:#14b8a6; }
    .field-error { color:#f87171; font-size:0.78rem; }
    .auth-error { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#f87171; border-radius:0.5rem; padding:0.75rem 1rem; font-size:0.875rem; display:flex; align-items:center; gap:0.5rem; }
    .w-full { width:100%; justify-content:center; }
    .btn-primary:disabled { opacity:0.7; cursor:not-allowed; }
    .resend-btn { width:100%; padding:0.6rem 1rem; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); color:#fbbf24; border-radius:0.5rem; font-size:0.85rem; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.4rem; transition:all 0.2s; margin-top:0.5rem; }
    .resend-btn:hover { background:rgba(245,158,11,0.2); }
    .resend-btn:disabled { opacity:0.6; cursor:not-allowed; }
    .auth-demo-hint { color:#4b5563; font-size:0.8rem; text-align:center; margin-top:1.5rem; }
    .auth-demo-hint strong { color:#6b7280; }
    @media(max-width:768px) { .auth-layout { grid-template-columns:1fr; } .auth-left { display:none; } .auth-right { min-height:100vh; padding:1.5rem; } }
  `]
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
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
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
      }
    });
  }

  resendVerification() {
    const email = this.form.get('email')?.value;
    if (!email) { this.toast.error('Error', 'Please enter your email first.'); return; }
    this.resending.set(true);
    this.http.post<{ message: string }>(`${environment.apiUrl}/auth/resend-verification`, { email }).subscribe({
      next: (res) => {
        this.resending.set(false);
        this.toast.success('Email Sent', res.message);
        this.showResend.set(false);
      },
      error: (e) => {
        this.resending.set(false);
        this.toast.error('Error', e.error?.message || 'Could not resend verification email.');
      }
    });
  }
}
