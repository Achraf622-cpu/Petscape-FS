import { Component, OnInit, signal, inject } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-admin-donations',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  template: `
    <div class="page-enter">
      <h2 class="admin-page-title"><i class="bi bi-gift-fill"></i> Donations Overview</h2>

      @if (loading()) {
        <div class="skeleton" style="height:120px;border-radius:0.75rem;margin-bottom:1.5rem;"></div>
        <div class="skeleton" style="height:400px;border-radius:0.75rem;"></div>
      } @else {
        @if (data()) {
          <div class="stats-grid">
            <div class="stat-card glass-card revenue">
              <div class="icon-wrap"><i class="bi bi-cash-stack"></i></div>
              <div class="stat-info">
                <div class="stat-lbl">Total Raised</div>
                <div class="stat-val">{{ data()['totalAmount'] | currency: 'USD' }}</div>
              </div>
            </div>
            
            <div class="stat-card glass-card donors">
              <div class="icon-wrap"><i class="bi bi-people-fill"></i></div>
              <div class="stat-info">
                <div class="stat-lbl">Unique Donors</div>
                <div class="stat-val">{{ data()['uniqueDonors'] }}</div>
              </div>
            </div>

            <div class="stat-card glass-card average">
              <div class="icon-wrap"><i class="bi bi-graph-up-arrow"></i></div>
              <div class="stat-info">
                <div class="stat-lbl">Avg. Donation</div>
                <div class="stat-val">{{ data()['averageDonation'] | currency: 'USD' }}</div>
              </div>
            </div>
          </div>

          <div class="glass-card table-container">
            <h3>Recent Donations</h3>
            <div class="table-wrap">
              @if (data()['donations']?.content?.length > 0) {
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Donor Email</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (d of data()['donations'].content; track d.id) {
                      <tr>
                        <td class="text-muted-custom">#{{ d.id }}</td>
                        <td><strong>{{ d.userEmail }}</strong></td>
                        <td class="amount-cell">{{ d.amount | currency:'USD' }}</td>
                        <td>
                          @if (d.status === 'COMPLETED') {
                            <span class="status-badge badge-approved"><i class="bi bi-check-circle"></i> Paid</span>
                          } @else {
                            <span class="status-badge badge-pending"><i class="bi bi-clock"></i> {{ d.status }}</span>
                          }
                        </td>
                        <td class="text-muted-custom">{{ d.createdAt | date:'MMM d, y, h:mm a' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <div class="empty-state">
                  <i class="bi bi-inbox"></i>
                  <p>No donations recorded yet.</p>
                </div>
              }
            </div>
          </div>

          @if (data()['donations']?.totalPages > 1) {
            <div class="pag-wrap">
              <button class="page-btn" [disabled]="data()['donations'].first" (click)="load(data()['donations'].number-1)">
                <i class="bi bi-chevron-left"></i>
              </button>
              <span class="page-info">{{ data()['donations'].number+1 }} / {{ data()['donations'].totalPages }}</span>
              <button class="page-btn" [disabled]="data()['donations'].last" (click)="load(data()['donations'].number+1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .admin-page-title { font-size:1.5rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.6rem; margin-bottom:1.5rem; } .admin-page-title i { color:#a78bfa; }
    
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:1.25rem; margin-bottom:1.5rem; }
    .stat-card { padding:1.5rem; display:flex; align-items:center; gap:1.25rem; }
    .icon-wrap { width:52px; height:52px; border-radius:1rem; display:flex; align-items:center; justify-content:center; font-size:1.75rem; }
    
    .revenue .icon-wrap { background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); }
    .donors .icon-wrap { background:rgba(59,130,246,0.15); color:#3b82f6; border:1px solid rgba(59,130,246,0.3); }
    .average .icon-wrap { background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.3); }
    
    .stat-info { display:flex; flex-direction:column; gap:0.25rem; }
    .stat-lbl { font-size:0.85rem; color:#9ca3af; font-weight:500; text-transform:uppercase; letter-spacing:0.05em; }
    .stat-val { font-size:1.75rem; font-weight:800; color:#f9fafb; line-height:1; }
    
    .table-container { padding:1.5rem; }
    .table-container h3 { font-size:1.1rem; font-weight:700; color:#f9fafb; margin-bottom:1.25rem; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:0.75rem; }
    .table-wrap { overflow-x:auto; }
    
    .amount-cell { font-weight:700; color:#10b981; }
    .text-muted-custom { color:#6b7280; }
    
    .empty-state { padding:3rem 1rem; text-align:center; color:#6b7280; }
    .empty-state i { font-size:3rem; margin-bottom:1rem; display:block; opacity:0.5; }
    
    .pag-wrap { display:flex; align-items:center; gap:0.75rem; justify-content:center; margin-top:1.25rem; }
    .page-btn { background:rgba(31,41,55,0.7); border:1px solid rgba(255,255,255,0.07); color:#9ca3af; border-radius:0.5rem; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; }
    .page-btn:hover:not(:disabled) { background:rgba(55,65,81,0.9); color:#f9fafb; }
    .page-btn:disabled { opacity:0.35; cursor:not-allowed; }
    .page-info { color:#6b7280; font-size:0.875rem; font-weight:500; }
  `]
})
export class AdminDonationsComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  data = signal<any>(null);

  ngOnInit() { this.load(0); }

  load(page: number) {
    this.loading.set(true);
    this.adminService.getDonations(page).subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
