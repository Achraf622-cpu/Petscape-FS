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
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
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
    lastname: ['', Validators.required],
  });

  passForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
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
      next: () => {
        this.profileLoading.set(false);
        this.toast.success('Profile updated!');
      },
      error: (e) => {
        this.profileLoading.set(false);
        this.toast.error('Error', e.error?.message);
      },
    });
  }

  changePassword() {
    if (this.passForm.invalid) {
      this.passForm.markAllAsTouched();
      return;
    }
    this.passLoading.set(true);
    this.userService.changePassword(this.passForm.value as any).subscribe({
      next: () => {
        this.passLoading.set(false);
        this.passForm.reset();
        this.toast.success('Password updated!');
      },
      error: (e) => {
        this.passLoading.set(false);
        this.toast.error('Error', e.error?.message || 'Check your current password.');
      },
    });
  }

  resendVerification() {
    if (!this.email()) return;
    this.resending.set(true);
    this.http
      .post<{
        message: string;
      }>(`${environment.apiUrl}/auth/resend-verification`, { email: this.email() })
      .subscribe({
        next: (res) => {
          this.resending.set(false);
          this.toast.success('Email Sent', res.message);
        },
        error: (e) => {
          this.resending.set(false);
          this.toast.error('Error', e.error?.message || 'Could not resend verification email.');
        },
      });
  }
}
