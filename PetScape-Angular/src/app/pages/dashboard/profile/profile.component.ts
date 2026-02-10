import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-enter">
      <div class="page-title">
        <h2><i class="bi bi-person-fill"></i> My Profile</h2>
        <p>Manage your account information</p>
      </div>

      @if (!emailVerified()) {
        <div class="verify-banner">
          <div class="banner-content">
            <i class="bi bi-exclamation-triangle-fill text-yellow-400"></i>
            <div>
              <strong>Your email is not verified!</strong>
              <p>Please verify your email address to secure your account.</p>
            </div>
          </div>
          <button class="btn-resend" (click)="resendVerification()" [disabled]="resending()">
            @if (resending()) {
              <span class="spinner-border spinner-border-sm"></span>
            } @else {
              Resend Email
            }
          </button>
        </div>
      }

      <div class="profile-grid">
        <!-- Profile Info Card -->
        <div class="glass-card profile-card">
          <h3>Personal Information</h3>
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="field-row">
              <div class="field">
                <label>First Name</label>
                <input type="text" formControlName="firstname" class="form-control" />
              </div>
              <div class="field">
                <label>Last Name</label>
                <input type="text" formControlName="lastname" class="form-control" />
              </div>
            </div>
            <div class="field">
              <label>Email</label>
              <input type="email" [value]="email()" class="form-control" disabled />
              <small class="hint">Email cannot be changed</small>
            </div>
            <button type="submit" class="btn-primary" [disabled]="profileLoading()">
              @if (profileLoading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
              Save Changes
            </button>
          </form>
        </div>

        <!-- Change Password -->
        <div class="glass-card profile-card">
          <h3>Change Password</h3>
          <form [formGroup]="passForm" (ngSubmit)="changePassword()">
            <div class="field">
              <label>Current Password</label>
              <input type="password" formControlName="currentPassword" class="form-control" />
            </div>
            <div class="field">
              <label>New Password</label>
              <input type="password" formControlName="newPassword" class="form-control" />
              @if (passForm.get('newPassword')?.invalid && passForm.get('newPassword')?.touched) {
                <span class="field-error">Min. 6 characters</span>
              }
            </div>
            <button type="submit" class="btn-outline" [disabled]="passLoading()">
              @if (passLoading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { margin-bottom:1.5rem; }
    .page-title h2 { font-size:1.4rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.5rem; }
    .page-title h2 i { color:#14b8a6; }
    .page-title p { color:#6b7280; font-size:0.875rem; }
    
    .verify-banner { background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:1rem; padding:1.25rem 1.5rem; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap; }
    .banner-content { display:flex; gap:1rem; align-items:center; color:#f9fafb; }
    .banner-content i { font-size:1.5rem; }
    .banner-content strong { display:block; font-size:1.05rem; }
    .banner-content p { margin:0; font-size:0.875rem; color:#d1d5db; }
    .text-yellow-400 { color:#fbbf24; }
    .btn-resend { background:rgba(245,158,11,0.2); border:1px solid rgba(245,158,11,0.5); color:#fbbf24; padding:0.5rem 1rem; border-radius:0.5rem; font-weight:600; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
    .btn-resend:hover:not(:disabled) { background:rgba(245,158,11,0.3); }
    .btn-resend:disabled { opacity:0.6; cursor:not-allowed; }

    .profile-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
    .profile-card { padding:1.75rem; }
    .profile-card h3 { font-size:1.05rem; font-weight:700; color:#f9fafb; margin-bottom:1.25rem; padding-bottom:0.75rem; border-bottom:1px solid rgba(255,255,255,0.06); }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
    .field { display:flex; flex-direction:column; gap:0.35rem; margin-bottom:1rem; }
    .field label { color:#9ca3af; font-size:0.85rem; font-weight:500; }
    .hint { color:#4b5563; font-size:0.75rem; margin-top:0.2rem; }
    .field-error { color:#f87171; font-size:0.78rem; }
    .btn-primary, .btn-outline { margin-top:0.5rem; }
    .btn-primary:disabled, .btn-outline:disabled { opacity:0.7; cursor:not-allowed; }
    @media(max-width:768px) { .profile-grid { grid-template-columns:1fr; } .field-row { grid-template-columns:1fr; } }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private http = inject(HttpClient);

  profileLoading = signal(false);
  passLoading = signal(false);
  resending = signal(false);
  email = signal('');
  emailVerified = signal(true);

  profileForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required]
  });

  passForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    const u = this.auth.currentUser();
    if (u) {
      this.profileForm.patchValue({ firstname: u.firstname, lastname: u.lastname });
      this.email.set(u.email ?? '');
      this.emailVerified.set(u.emailVerified ?? true);
    }
  }

  updateProfile() {
    if (this.profileForm.invalid) return;
    this.profileLoading.set(true);
    this.userService.updateProfile(this.profileForm.value as any).subscribe({
      next: () => { this.profileLoading.set(false); this.toast.success('Profile updated!'); },
      error: (e) => { this.profileLoading.set(false); this.toast.error('Error', e.error?.message); }
    });
  }

  changePassword() {
    if (this.passForm.invalid) { this.passForm.markAllAsTouched(); return; }
    this.passLoading.set(true);
    this.userService.changePassword(this.passForm.value as any).subscribe({
      next: () => { this.passLoading.set(false); this.passForm.reset(); this.toast.success('Password updated!'); },
      error: (e) => { this.passLoading.set(false); this.toast.error('Error', e.error?.message || 'Check your current password.'); }
    });
  }

  resendVerification() {
    if (!this.email()) return;
    this.resending.set(true);
    this.http.post<{ message: string }>(`${environment.apiUrl}/auth/resend-verification`, { email: this.email() }).subscribe({
      next: (res) => {
        this.resending.set(false);
        this.toast.success('Email Sent', res.message);
      },
      error: (e) => {
        this.resending.set(false);
        this.toast.error('Error', e.error?.message || 'Could not resend verification email.');
      }
    });
  }
}
