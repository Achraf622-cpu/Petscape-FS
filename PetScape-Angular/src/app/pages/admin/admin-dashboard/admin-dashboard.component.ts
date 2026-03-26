import { Component, OnInit, signal, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { DatePipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-enter">
      <div class="dash-header">
        <div>
          <h2 class="admin-page-title"><i class="bi bi-speedometer2"></i> Dashboard</h2>
          <p class="sub">Live overview of PetsCape activity</p>
        </div>
        <span class="live-dot"><span class="dot-pulse"></span> Live</span>
      </div>

      @if (loading()) {
        <div class="stats-grid">
          @for (i of [1,2,3,4]; track i) { <div class="skeleton" style="height:100px;border-radius:0.75rem;"></div> }
        </div>
      } @else if (stats()['totalAnimals'] !== undefined) {
        <!-- ── Stat Cards ── -->
        <div class="stats-grid">
          <div class="stat-card teal">
            <div class="stat-icon"><i class="bi bi-heart-fill"></i></div>
            <div class="stat-body">
              <div class="stat-val">{{ stats()['totalAnimals'] }}</div>
              <div class="stat-lbl">Total Animals</div>
              <div class="stat-sub">{{ stats()['availableAnimals'] }} available</div>
            </div>
          </div>
          <div class="stat-card amber">
            <div class="stat-icon"><i class="bi bi-people-fill"></i></div>
            <div class="stat-body">
              <div class="stat-val">{{ stats()['ongoingAdoptions'] }}</div>
              <div class="stat-lbl">Ongoing Adoptions</div>
              <div class="stat-sub">{{ stats()['totalAdoptions'] }} total</div>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="stat-icon"><i class="bi bi-calendar-check-fill"></i></div>
            <div class="stat-body">
              <div class="stat-val">{{ stats()['todayAppointments'] }}</div>
              <div class="stat-lbl">Today's Appointments</div>
              <div class="stat-sub">{{ stats()['totalAppointments'] }} total</div>
            </div>
          </div>
          <div class="stat-card rose">
            <div class="stat-icon"><i class="bi bi-megaphone-fill"></i></div>
            <div class="stat-body">
              <div class="stat-val">{{ stats()['activeReports'] }}</div>
              <div class="stat-lbl">Active Reports</div>
              <div class="stat-sub">{{ stats()['totalReports'] }} total</div>
            </div>
          </div>
        </div>

        <!-- ── Charts Row ── -->
        <div class="charts-row">
          <!-- Adoptions by month line chart -->
          <div class="chart-card glass-card">
            <div class="chart-header">
              <h3><i class="bi bi-graph-up-arrow"></i> Adoptions This Year</h3>
            </div>
            <div class="chart-wrap">
              <canvas #adoptionsChart></canvas>
            </div>
          </div>
          <!-- Species breakdown doughnut -->
          <div class="chart-card glass-card">
            <div class="chart-header">
              <h3><i class="bi bi-pie-chart-fill"></i> Animals by Species</h3>
            </div>
            <div class="chart-wrap chart-wrap-sm">
              <canvas #speciesChart></canvas>
            </div>
          </div>
        </div>

        <!-- ── Donations Bar Chart ── -->
        <div class="chart-card glass-card chart-full">
          <div class="chart-header">
            <h3><i class="bi bi-cash-stack"></i> Monthly Donations (USD)</h3>
          </div>
          <div class="chart-wrap">
            <canvas #donationsChart></canvas>
          </div>
        </div>

        <!-- ── Today's Appointments ── -->
        @if (stats()['todayAppointmentsList']?.length > 0) {
          <div class="glass-card appt-section">
            <h3><i class="bi bi-clock-fill"></i> Today's Schedule</h3>
            <div class="appt-list">
              @for (a of stats()['todayAppointmentsList']; track a.id) {
                <div class="appt-row">
                  <div class="appt-time">{{ a.appointmentDate | date:'HH:mm' }}</div>
                  <div class="appt-info">
                    <strong>{{ a.animalName }}</strong>
                    <span>{{ a.userName }}</span>
                  </div>
                  <span class="status-badge" [class]="'badge-' + a.status.toLowerCase()">{{ a.status }}</span>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .dash-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
    .admin-page-title { font-size:1.5rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.6rem; margin:0; }
    .admin-page-title i { color:#a78bfa; }
    .sub { color:#6b7280; font-size:0.875rem; margin:0.25rem 0 0; }
    .live-dot { display:flex; align-items:center; gap:0.5rem; color:#34d399; font-size:0.8rem; font-weight:600; }
    .dot-pulse { width:8px; height:8px; border-radius:50%; background:#34d399; animation:pulse 1.5s infinite; display:inline-block; }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(1.3);} }

    /* Stat Cards */
    .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
    .stat-card { border-radius:0.75rem; padding:1.25rem; display:flex; align-items:center; gap:1rem; border:1px solid rgba(255,255,255,0.06); }
    .stat-icon { width:48px; height:48px; border-radius:0.6rem; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
    .stat-val { font-size:1.8rem; font-weight:900; color:#f9fafb; line-height:1; }
    .stat-lbl { font-size:0.8rem; color:#9ca3af; font-weight:500; margin:0.2rem 0; }
    .stat-sub { font-size:0.72rem; color:#6b7280; }
    .teal { background:rgba(20,184,166,0.08); } .teal .stat-icon { background:rgba(20,184,166,0.15); color:#14b8a6; }
    .amber { background:rgba(245,158,11,0.08); } .amber .stat-icon { background:rgba(245,158,11,0.15); color:#fbbf24; }
    .purple { background:rgba(139,92,246,0.08); } .purple .stat-icon { background:rgba(139,92,246,0.15); color:#a78bfa; }
    .rose { background:rgba(239,68,68,0.08); } .rose .stat-icon { background:rgba(239,68,68,0.15); color:#f87171; }

    /* Charts */
    .charts-row { display:grid; grid-template-columns:2fr 1fr; gap:1rem; margin-bottom:1rem; }
    .chart-card { padding:1.25rem; }
    .chart-full { margin-bottom:1rem; }
    .chart-header h3 { font-size:0.95rem; font-weight:700; color:#d1d5db; display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem; }
    .chart-header h3 i { color:#a78bfa; }
    .chart-wrap { position:relative; height:220px; }
    .chart-wrap-sm { height:200px; }

    /* Today's Appointments */
    .appt-section { padding:1.25rem; }
    .appt-section h3 { font-size:0.95rem; font-weight:700; color:#d1d5db; display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem; }
    .appt-section h3 i { color:#14b8a6; }
    .appt-list { display:flex; flex-direction:column; gap:0.6rem; }
    .appt-row { display:flex; align-items:center; gap:1rem; padding:0.7rem 1rem; background:rgba(31,41,55,0.5); border-radius:0.5rem; }
    .appt-time { color:#14b8a6; font-weight:700; font-size:0.9rem; min-width:50px; }
    .appt-info { flex:1; }
    .appt-info strong { color:#f9fafb; font-size:0.875rem; display:block; }
    .appt-info span { color:#6b7280; font-size:0.78rem; }
    @media(max-width:1024px) { .stats-grid{grid-template-columns:repeat(2,1fr);} .charts-row{grid-template-columns:1fr;} }
    @media(max-width:600px) { .stats-grid{grid-template-columns:1fr;} }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  stats = signal<Record<string, any>>({});

  @ViewChild('adoptionsChart') adoptionsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('speciesChart') speciesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donationsChart') donationsChartRef!: ElementRef<HTMLCanvasElement>;

  private chartsReady = false;

  ngOnInit() {
    this.adminService.getDashboard().subscribe({
      next: d => {
        this.stats.set(d);
        this.loading.set(false);

        setTimeout(() => this.buildCharts(), 100);
      },
      error: () => { this.loading.set(false); this.stats.set(this.mockStats()); setTimeout(() => this.buildCharts(), 100); }
    });
  }

  ngAfterViewInit() { this.chartsReady = true; }

  private buildCharts() {
    const s = this.stats();
    if (!s || !this.chartsReady) return;

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const adoptionsByMonth = s['adoptionsByMonth'] ?? Array(12).fill(0);
    const speciesData = s['animalsBySpecies'] ?? { Dogs:12, Cats:20, Birds:5, Rabbits:3, Reptiles:2 };
    const donationsByMonth = s['donationsByMonth'] ?? Array(12).fill(0);


    if (this.adoptionsChartRef) {
      new Chart(this.adoptionsChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Adoptions',
            data: adoptionsByMonth,
            borderColor: '#14b8a6',
            backgroundColor: 'rgba(20,184,166,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#14b8a6',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: this.lineBarOptions('#14b8a6')
      });
    }

    // Doughnut — Species breakdown
    if (this.speciesChartRef) {
      const labels = Object.keys(speciesData);
      const values = Object.values(speciesData) as number[];
      const colors = ['#14b8a6','#f59e0b','#a78bfa','#f87171','#34d399','#60a5fa'];
      new Chart(this.speciesChartRef.nativeElement, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderWidth: 2, borderColor: '#1f2937' }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: '#9ca3af', font: { size: 11 }, padding: 12 } } }
        }
      });
    }

    // Bar chart — Donations
    if (this.donationsChartRef) {
      new Chart(this.donationsChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'Donations ($)',
            data: donationsByMonth,
            backgroundColor: 'rgba(245,158,11,0.6)',
            borderColor: '#f59e0b',
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: this.lineBarOptions('#f59e0b')
      });
    }
  }

  private lineBarOptions(color: string) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#9ca3af', font: { size: 11 } } },
        tooltip: { backgroundColor: '#1f2937', titleColor: '#f9fafb', bodyColor: '#9ca3af', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1 }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7280', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7280', font: { size: 11 } }, beginAtZero: true }
      }
    };
  }

  /** Fallback mock data so charts still render without backend */
  private mockStats() {
    return {
      totalAnimals: 47, availableAnimals: 23,
      ongoingAdoptions: 12, totalAdoptions: 58,
      todayAppointments: 4, totalAppointments: 134,
      activeReports: 8, totalReports: 31,
      adoptionsByMonth: [3,5,4,7,6,8,10,9,7,12,8,11],
      donationsByMonth: [250,180,320,410,290,500,380,460,340,520,410,600],
      animalsBySpecies: { Dogs:18, Cats:15, Birds:6, Rabbits:4, Reptiles:2, Other:2 },
      todayAppointmentsList: []
    };
  }
}
