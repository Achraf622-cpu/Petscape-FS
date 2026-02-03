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
  template: `
    <div class="page-enter">
      <h2 class="admin-page-title"><i class="bi bi-person-fill"></i> Users Management</h2>

      @if (loading()) {
        <div class="skeleton" style="height:400px;border-radius:0.75rem;"></div>
      } @else {
        <div class="table-wrap glass-card">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Registered</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (u of page().content; track u.id) {
                <tr [class.banned-row]="u.banned">
                  <td class="text-muted-custom">{{ u.id }}</td>
                  <td>
                    <strong>{{ u.firstname }} {{ u.lastname }}</strong>
                    @if (u.banned) {
                      <div class="ban-reason-sub">Banned: {{ u.banReason }}</div>
                    }
                  </td>
                  <td class="text-muted-custom">{{ u.email }}</td>
                  <td>
                    <span [class]="u.role === 'ADMIN' ? 'role-admin' : 'role-user'">{{ u.role }}</span>
                  </td>
                  <td>
                    @if (u.banned) {
                      <span class="status-badge badge-rejected"><i class="bi bi-slash-circle"></i> Banned</span>
                    } @else {
                      <span class="status-badge badge-approved"><i class="bi bi-check-circle"></i> Active</span>
                    }
                  </td>
                  <td>
                    <i [class]="u.emailVerified ? 'bi bi-check-circle-fill verified' : 'bi bi-x-circle-fill not-verified'"></i>
                  </td>
                  <td class="text-muted-custom">{{ u.createdAt | date:'MMM d, y' }}</td>
                  <td class="text-end">
                    <div class="action-btns">
                      <!-- Role Toggle -->
                      @if (u.role === 'USER') {
                        <button class="btn-icon btn-outline" title="Make Admin" (click)="changeRole(u, 'ADMIN')">
                          <i class="bi bi-shield-lock-fill text-purple-400"></i>
                        </button>
                      } @else {
                        <button class="btn-icon btn-outline" title="Make User" (click)="changeRole(u, 'USER')">
                          <i class="bi bi-person-fill text-teal-400"></i>
                        </button>
                      }
                      
                      <!-- Ban / Unban -->
                      @if (!u.banned) {
                        <button class="btn-icon btn-danger-outline" title="Ban User" (click)="openBanModal(u)" [disabled]="u.role === 'ADMIN'">
                          <i class="bi bi-hammer"></i>
                        </button>
                      } @else {
                        <button class="btn-icon btn-success-outline" title="Unban User" (click)="promptUnban(u)">
                          <i class="bi bi-check-circle"></i>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (page().totalPages > 1) {
          <div class="pag-wrap">
            <button class="page-btn" [disabled]="page().first" (click)="load(page().number-1)"><i class="bi bi-chevron-left"></i></button>
            <span class="page-info">{{ page().number+1 }} / {{ page().totalPages }}</span>
            <button class="page-btn" [disabled]="page().last" (click)="load(page().number+1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        }
      }
    </div>

    <!-- Ban Modal -->
    @if (showBanModal()) {
      <div class="modal-backdrop">
        <div class="modal-custom glass-card">
          <div class="modal-header">
            <h3>Ban {{ selectedUser()?.firstname }}</h3>
            <button class="btn-close-custom" (click)="closeBanModal()"><i class="bi bi-x"></i></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="banForm" (ngSubmit)="submitBan()">
              <div class="form-group mb-3">
                <label>Ban Reason*</label>
                <select formControlName="reason" class="form-control" [class.is-invalid]="banForm.get('reason')?.invalid && banForm.get('reason')?.touched">
                  <option value="">Select a reason</option>
                  <option value="SPAM">Spam</option>
                  <option value="ABUSE">Abuse / Harassment</option>
                  <option value="FRAUD">Fraud / Scams</option>
                  <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
                  <option value="FAKE_REPORTS">Fake Reports</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div class="form-group mb-3">
                <label>Duration (Days)</label>
                <input type="number" formControlName="durationDays" class="form-control" placeholder="Leave blank for permanent ban" min="1">
              </div>
              <div class="form-group mb-3">
                <label>Additional Comments</label>
                <textarea formControlName="comment" class="form-control" rows="3" placeholder="Internal notes about this ban..."></textarea>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-outline" (click)="closeBanModal()">Cancel</button>
                <button type="submit" class="btn-danger" [disabled]="banForm.invalid || savingBan()">
                  @if (savingBan()) { <span class="spinner-border spinner-border-sm me-1"></span> }
                  Ban User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Unban Modal -->
    @if (showUnbanModal()) {
      <div class="modal-backdrop">
        <div class="modal-custom glass-card text-center" style="max-width:350px;">
          <div class="check-circle" style="background:rgba(34,197,94,0.15); color:#22c55e; width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 1rem;">
            <i class="bi bi-check-circle"></i>
          </div>
          <h3 style="color:#f9fafb; margin-bottom:0.5rem; font-weight:700;">Unban User?</h3>
          <p style="color:#9ca3af; font-size:0.9rem; margin-bottom:1.5rem; line-height:1.5;">
            Are you sure you want to unban <strong>{{ userToUnban()?.firstname }}</strong>? They will be able to log in again immediately.
          </p>
          <div style="display:flex; gap:0.5rem; justify-content:center;">
            <button class="btn-outline" style="flex:1; padding:0.5rem; border-radius:0.5rem;" (click)="closeUnbanModal()">Cancel</button>
            <button class="btn-success" style="flex:1; padding:0.5rem; border-radius:0.5rem; background:#22c55e; color:white; border:none; font-weight:600; cursor:pointer;" [disabled]="savingUnban()" (click)="confirmUnban()">
              @if (savingUnban()) { <span class="spinner-border spinner-border-sm"></span> } @else { Yes, Unban }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-page-title { font-size:1.5rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.6rem; margin-bottom:1.5rem; } .admin-page-title i { color:#a78bfa; }
    .table-wrap { overflow-x:auto; }
    .text-muted-custom { color:#6b7280; }
    .role-admin { background:rgba(139,92,246,0.15); color:#a78bfa; border:1px solid rgba(139,92,246,0.3); border-radius:999px; padding:0.15rem 0.6rem; font-size:0.75rem; font-weight:700; }
    .role-user  { background:rgba(15,118,110,0.15); color:#14b8a6; border:1px solid rgba(15,118,110,0.3); border-radius:999px; padding:0.15rem 0.6rem; font-size:0.75rem; font-weight:700; }
    .verified     { color:#34d399; }
    .not-verified { color:#f87171; }
    .banned-row td { opacity: 0.6; }
    .ban-reason-sub { font-size:0.75rem; color:#ef4444; margin-top:2px; }
    
    .action-btns { display:flex; gap:0.4rem; justify-content:flex-end; }
    .btn-icon { width:32px; height:32px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:0.5rem; cursor:pointer; background:transparent; transition:all 0.2s; }
    .btn-icon:disabled { opacity:0.3; cursor:not-allowed; }
    .btn-outline { border:1px solid rgba(255,255,255,0.1); color:#d1d5db; }
    .btn-outline:hover:not(:disabled) { background:rgba(255,255,255,0.05); }
    .btn-danger-outline { border:1px solid rgba(239,68,68,0.3); color:#ef4444; }
    .btn-danger-outline:hover:not(:disabled) { background:rgba(239,68,68,0.1); }
    .btn-success-outline { border:1px solid rgba(34,197,94,0.3); color:#22c55e; }
    .btn-success-outline:hover:not(:disabled) { background:rgba(34,197,94,0.1); }
    
    .pag-wrap { display:flex; align-items:center; gap:0.75rem; justify-content:center; margin-top:1.25rem; }
    .page-btn { background:rgba(31,41,55,0.7); border:1px solid rgba(255,255,255,0.07); color:#9ca3af; border-radius:0.5rem; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .page-btn:disabled { opacity:0.35; cursor:not-allowed; }
    .page-info { color:#6b7280; font-size:0.875rem; }
    
    /* Modal Styles */
    .modal-backdrop { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:center; justify-content:center; padding:1rem; }
    .modal-custom { background:#1f2937; border-radius:1rem; width:100%; max-width:400px; padding:1.5rem; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); }
    .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
    .modal-header h3 { margin:0; font-size:1.25rem; font-weight:700; color:#f9fafb; }
    .btn-close-custom { background:none; border:none; color:#9ca3af; font-size:1.5rem; cursor:pointer; padding:0; line-height:1; }
    .btn-close-custom:hover { color:#f9fafb; }
    .form-group label { display:block; margin-bottom:0.5rem; color:#d1d5db; font-size:0.875rem; font-weight:500; }
    .form-control { width:100%; padding:0.6rem 1rem; background:rgba(17,24,39,0.7); border:1px solid rgba(255,255,255,0.1); border-radius:0.5rem; color:#f9fafb; transition:all 0.2s; }
    .form-control:focus { outline:none; border-color:#8b5cf6; box-shadow:0 0 0 3px rgba(139,92,246,0.2); }
    .is-invalid { border-color:#ef4444; }
    select.form-control option { background:#1f2937; }
    .modal-footer { display:flex; justify-content:flex-end; gap:0.75rem; margin-top:2rem; }
    .btn-danger { background:#dc2626; color:white; border:none; padding:0.6rem 1.25rem; border-radius:0.5rem; font-weight:600; cursor:pointer; }
    .btn-danger:hover:not(:disabled) { background:#b91c1c; }
    .btn-danger:disabled { opacity:0.7; cursor:not-allowed; }
  `]
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  page = signal<Page<UserResponse>>({ content:[], totalElements:0, totalPages:0, number:0, size:15, first:true, last:true });

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
    comment: ['']
  });

  ngOnInit() { this.load(0); }

  load(p: number) {
    this.loading.set(true);
    this.adminService.getUsers(p).subscribe({ 
      next: d => { this.page.set(d); this.loading.set(false); }, 
      error: () => this.loading.set(false) 
    });
  }

  changeRole(user: UserResponse, role: 'USER' | 'ADMIN') {
    if (confirm(`Are you sure you want to make ${user.firstname} an ${role}?`)) {
      this.adminService.changeRole(user.id, role).subscribe({
        next: () => {
          this.toast.success('Role Updated', `${user.firstname} is now an ${role}.`);
          this.load(this.page().number);
        },
        error: (e) => this.toast.error('Error', e.error?.message || 'Could not change role.')
      });
    }
  }

  openBanModal(user: UserResponse) {
    if (user.role === 'ADMIN') {
      this.toast.error('Cannot Ban Admin', 'Please change their role to USER first before banning.');
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
      }
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
      }
    });
  }
}
