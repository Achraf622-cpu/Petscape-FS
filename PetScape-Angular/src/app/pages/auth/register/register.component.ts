import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const pass = control.get('password')?.value;
  const conf = control.get('passwordConfirmation')?.value;
  return pass && conf && pass !== conf ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <div class="auth-left">
        <div class="auth-brand">
          <div class="brand-icon"><i class="bi bi-heart-fill"></i></div>
          <span>PetsCape</span>
        </div>
        <div class="auth-illustration">
          <div class="illustration-circle"><i class="bi bi-person-add"></i></div>
          <div class="float-badge badge1"><i class="bi bi-shield-check"></i> Secure & Private</div>
          <div class="float-badge badge2"><i class="bi bi-envelope-check"></i> Email Verification</div>
        </div>
        <h2>Join PetsCape</h2>
        <p>Create an account to adopt pets, book appointments, and help reunite lost animals with their families.</p>
      </div>
      <div class="auth-right">
        <div class="auth-card">
          @if (!registered()) {
            <h1>Create Account</h1>
            <p class="auth-subtitle">Already have an account? <a routerLink="/auth/login" class="link-primary">Sign in</a></p>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
              <div class="name-row">
                <div class="field">
                  <label>First Name</label>
                  <input type="text" formControlName="firstname" class="form-control" placeholder="John" />
                  @if (form.get('firstname')?.invalid && form.get('firstname')?.touched) {
                    <span class="field-error">Required</span>
                  }
                </div>
                <div class="field">
                  <label>Last Name</label>
                  <input type="text" formControlName="lastname" class="form-control" placeholder="Doe" />
                  @if (form.get('lastname')?.invalid && form.get('lastname')?.touched) {
                    <span class="field-error">Required</span>
                  }
                </div>
              </div>
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
                  <input [type]="showPass() ? 'text' : 'password'" formControlName="password" class="form-control" placeholder="Min. 6 characters" />
                  <button type="button" class="pass-toggle" (click)="showPass.update(v=>!v)">
                    <i [class]="showPass() ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                @if (form.get('password')?.invalid && form.get('password')?.touched) {
                  <span class="field-error">Min. 6 characters</span>
                }
              </div>
              <div class="field">
                <label>Confirm Password</label>
                <div class="input-wrap">
                  <i class="bi bi-lock-fill input-icon"></i>
                  <input [type]="showPass() ? 'text' : 'password'" formControlName="passwordConfirmation" class="form-control" placeholder="Repeat password" />
                </div>
                @if (form.errors?.['mismatch'] && form.get('passwordConfirmation')?.touched) {
                  <span class="field-error">Passwords do not match</span>
                }
              </div>
              @if (errorMsg()) {
                <div class="auth-error"><i class="bi bi-exclamation-circle-fill"></i> {{ errorMsg() }}</div>
              }
              <button type="submit" class="btn-primary w-full" [disabled]="loading()">
                @if (loading()) {
                  <span class="spinner-border spinner-border-sm me-2"></span> Creating account...
                } @else {
                  <i class="bi bi-person-plus"></i> Create Account
                }
              </button>
            </form>
          } @else {
            <div class="success-state">
              <div class="success-icon"><i class="bi bi-envelope-check-fill"></i></div>
              <h2>Check Your Email</h2>
              <p>We sent a verification link to <strong>{{ form.value.email }}</strong>. Click it to activate your account and start adopting!</p>
              <a routerLink="/auth/login" class="btn-primary mt-4">Go to Login</a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout,.auth-brand,.auth-left,.auth-right,.auth-card,.auth-form,.auth-subtitle,.auth-error,.field,.input-wrap,.input-icon,.pass-toggle,.field-error,.w-full { /* shared with login */ }
    .auth-layout { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
    .auth-left { background:linear-gradient(160deg,#0d1117 0%,#0f2e2b 50%,#111827 100%); display:flex; flex-direction:column; justify-content:center; align-items:center; padding:3rem; text-align:center; position:relative; overflow:hidden; }
    .auth-brand { display:flex; align-items:center; gap:0.6rem; margin-bottom:3rem; }
    .auth-brand .brand-icon { width:40px; height:40px; background:linear-gradient(135deg,#0f766e,#14b8a6); border-radius:12px; display:flex; align-items:center; justify-content:center; color:white; font-size:1.1rem; }
    .auth-brand span { font-size:1.5rem; font-weight:800; background:linear-gradient(135deg,#14b8a6,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .auth-illustration { position:relative; margin-bottom:2rem; }
    .illustration-circle { width:160px; height:160px; border-radius:50%; background:linear-gradient(135deg,rgba(15,118,110,0.2),rgba(20,184,166,0.1)); border:2px solid rgba(20,184,166,0.2); display:flex; align-items:center; justify-content:center; font-size:4rem; color:#14b8a6; margin:0 auto; }
    .float-badge { position:absolute; background:rgba(31,41,55,0.9); border:1px solid rgba(255,255,255,0.1); border-radius:999px; padding:0.4rem 0.9rem; font-size:0.8rem; color:#d1d5db; white-space:nowrap; }
    .badge1 { bottom:0; left:-10px; animation:float 3s ease-in-out infinite; }
    .badge2 { top:10px; right:-10px; animation:float 3s ease-in-out infinite 1.5s; }
    @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
    .auth-left h2 { font-size:1.75rem; font-weight:800; color:#f9fafb; margin-bottom:0.75rem; }
    .auth-left p { color:#6b7280; line-height:1.7; max-width:320px; }
    .auth-right { display:flex; align-items:center; justify-content:center; padding:2rem; background:#111827; }
    .auth-card { width:100%; max-width:440px; animation:fadeIn 0.4s ease; }
    .auth-card h1 { font-size:2rem; font-weight:800; color:#f9fafb; margin-bottom:0.25rem; }
    .auth-subtitle { color:#6b7280; font-size:0.9rem; margin-bottom:1.5rem; }
    .name-row { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
    .auth-form { display:flex; flex-direction:column; gap:1rem; }
    .field { display:flex; flex-direction:column; gap:0.35rem; }
    .field label { color:#9ca3af; font-size:0.875rem; font-weight:500; }
    .input-wrap { position:relative; }
    .input-icon { position:absolute; left:0.9rem; top:50%; transform:translateY(-50%); color:#4b5563; font-size:0.9rem; pointer-events:none; }
    .form-control { padding-left:2.5rem !important; }
    .pass-toggle { position:absolute; right:0.9rem; top:50%; transform:translateY(-50%); background:none; border:none; color:#4b5563; cursor:pointer; font-size:0.9rem; }
    .field-error { color:#f87171; font-size:0.78rem; }
    .auth-error { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#f87171; border-radius:0.5rem; padding:0.75rem 1rem; font-size:0.875rem; display:flex; align-items:center; gap:0.5rem; }
    .w-full { width:100%; justify-content:center; }
    .btn-primary:disabled { opacity:0.7; cursor:not-allowed; }
    .success-state { text-align:center; }
    .success-icon { font-size:4rem; color:#34d399; margin-bottom:1rem; }
    .success-state h2 { font-size:1.75rem; font-weight:800; color:#f9fafb; margin-bottom:0.75rem; }
    .success-state p { color:#6b7280; line-height:1.7; }
    .mt-4 { margin-top:1rem; }
    @media(max-width:768px) { .auth-layout { grid-template-columns:1fr; } .auth-left { display:none; } }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);
  showPass = signal(false);
  registered = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirmation: ['', Validators.required],
  }, { validators: passwordMatch });

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    this.auth.register(this.form.value as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.registered.set(true);
        this.toast.success('Account created!', 'Check your email to verify your account.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message ?? 'Registration failed. Please try again.');
      }
    });
  }
}
