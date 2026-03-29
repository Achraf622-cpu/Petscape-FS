import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserResponse, Page } from '../../../models/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  page = signal<Page<UserResponse>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 15,
    first: true,
    last: true,
  });

  // Modal State
  showBanModal = signal(false);
  selectedUser = signal<UserResponse | null>(null);
  savingBan = signal(false);

  showUnbanModal = signal(false);
  userToUnban = signal<UserResponse | null>(null);
  savingUnban = signal(false);

  banForm = this.fb.group({
    reason: ['', Validators.required],
    durationDays: [null],
    comment: [''],
  });

  ngOnInit() {
    this.load(0);
  }

  load(p: number) {
    this.loading.set(true);
    this.adminService.getUsers(p).subscribe({
      next: (d) => {
        this.page.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changeRole(user: UserResponse, role: 'USER' | 'ADMIN') {
    if (confirm(`Are you sure you want to make ${user.firstname} an ${role}?`)) {
      this.adminService.changeRole(user.id, role).subscribe({
        next: () => {
          this.toast.success('Role Updated', `${user.firstname} is now an ${role}.`);
          this.load(this.page().number);
        },
        error: (e) => this.toast.error('Error', e.error?.message || 'Could not change role.'),
      });
    }
  }

  openBanModal(user: UserResponse) {
    if (user.role === 'ADMIN') {
      this.toast.error(
        'Cannot Ban Admin',
        'Please change their role to USER first before banning.',
      );
      return;
    }
    this.selectedUser.set(user);
    this.banForm.reset({ reason: '', durationDays: null, comment: '' });
    this.showBanModal.set(true);
  }

  closeBanModal() {
    this.showBanModal.set(false);
    this.selectedUser.set(null);
  }

  submitBan() {
    if (this.banForm.invalid || !this.selectedUser()) return;
    this.savingBan.set(true);
    const userId = this.selectedUser()!.id;
    const req = this.banForm.value as any;

    this.adminService.banUser(userId, req).subscribe({
      next: () => {
        this.savingBan.set(false);
        this.closeBanModal();
        this.toast.success('User Banned', 'The user has been successfully banned.');
        this.load(this.page().number);
      },
      error: (e) => {
        this.savingBan.set(false);
        this.toast.error('Error', e.error?.message || 'Could not ban user.');
      },
    });
  }

  promptUnban(user: UserResponse) {
    this.userToUnban.set(user);
    this.showUnbanModal.set(true);
  }

  closeUnbanModal() {
    this.showUnbanModal.set(false);
    this.userToUnban.set(null);
  }

  confirmUnban() {
    const user = this.userToUnban();
    if (!user) return;
    this.savingUnban.set(true);
    this.adminService.unbanUser(user.id).subscribe({
      next: () => {
        this.savingUnban.set(false);
        this.closeUnbanModal();
        this.toast.success('User Unbanned', `${user.firstname} has been unbanned.`);
        this.load(this.page().number);
      },
      error: (e) => {
        this.savingUnban.set(false);
        this.toast.error('Error', e.error?.message || 'Could not unban user.');
      },
    });
  }
}
