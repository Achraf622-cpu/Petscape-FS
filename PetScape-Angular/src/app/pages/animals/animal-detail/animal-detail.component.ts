import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../../../core/services/animal.service';
import { SpeciesService } from '../../../core/services/species.service';
import { AdoptionRequestService } from '../../../core/services/adoption-request.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AnimalResponse, SpeciesResponse } from '../../../models/models';

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    @if (loading()) {
      <div class="detail-skeleton">
        <div class="skeleton" style="height:420px; border-radius:1rem;"></div>
        <div class="detail-content">
          <div class="skeleton" style="height:40px;width:60%; border-radius:0.5rem;"></div>
          <div class="skeleton mt-3" style="height:120px; border-radius:0.5rem;"></div>
        </div>
      </div>
    } @else if (animal()) {
      <div class="detail-page page-enter">
        <div class="container-custom">
          <!-- Breadcrumb -->
          <nav class="breadcrumb-nav">
            <a routerLink="/animals"><i class="bi bi-arrow-left"></i> Back to Animals</a>
          </nav>

          <div class="detail-grid">
            <!-- Image -->
            <div class="detail-img-wrap">
              @if (animal()!.image) {
                <img [src]="animalService.imageUrl(animal()!.image)" [alt]="animal()!.name" class="detail-img" />
              } @else {
                <div class="detail-no-img"><i class="bi bi-heart-fill"></i></div>
              }
              <span class="status-badge detail-status" [class]="'badge-' + animal()!.status.toLowerCase()">
                {{ animal()!.status }}
              </span>
            </div>

            <!-- Info -->
            <div class="detail-info">
              <h1>{{ animal()!.name }}</h1>

              <div class="meta-chips">
                <span class="chip"><i class="bi bi-tag"></i> {{ animal()!.speciesName }}</span>
                <span class="chip"><i class="bi bi-gender-ambiguous"></i> {{ animal()!.gender }}</span>
                <span class="chip"><i class="bi bi-calendar3"></i> {{ animal()!.age }} year{{ animal()!.age===1?'':'s' }}</span>
                <span class="chip"><i class="bi bi-shuffle"></i> {{ animal()!.breed }}</span>
              </div>

              <p class="detail-desc">{{ animal()!.description }}</p>

              @if (animal()!.status === 'AVAILABLE') {
                @if (isLoggedIn()) {
                  <!-- Adopt Button -->
                  @if (!requestSent()) {
                    <div class="action-card">
                      <h3><i class="bi bi-heart"></i> Adopt {{ animal()!.name }}</h3>
                      <textarea [(ngModel)]="adoptMessage" class="form-control mb-3" rows="3" placeholder="Tell us why you'd be a great owner..."></textarea>
                      <button class="btn-primary w-full" (click)="submitAdoptRequest()" [disabled]="adoptLoading()">
                        @if (adoptLoading()) {
                          <span class="spinner-border spinner-border-sm me-2"></span>
                        }
                        Submit Adoption Request
                      </button>
                    </div>
                  } @else {
                    <div class="success-banner">
                      <i class="bi bi-check-circle-fill"></i>
                      Adoption request submitted! We'll review it shortly.
                    </div>
                  }

                  <!-- Book Appointment -->
                  @if (!appointmentSent()) {
                    <div class="action-card mt-4">
                      <h3><i class="bi bi-calendar-check"></i> Book a Visit</h3>
                      <div class="appointment-form">
                        <input type="date" [(ngModel)]="apptDate" class="form-control" [min]="minDate()" />
                        <select [(ngModel)]="apptSlot" class="form-select">
                          <option value="">Select time slot</option>
                          <option>09:00 - 10:00</option>
                          <option>10:00 - 11:00</option>
                          <option>11:00 - 12:00</option>
                          <option>14:00 - 15:00</option>
                          <option>15:00 - 16:00</option>
                          <option>16:00 - 17:00</option>
                        </select>
                        <button class="btn-outline w-full" (click)="bookAppointment()" [disabled]="apptLoading()">
                          @if (apptLoading()) {
                            <span class="spinner-border spinner-border-sm me-2"></span>
                          }
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="success-banner mt-4">
                      <i class="bi bi-check-circle-fill"></i> Appointment booked!
                    </div>
                  }
                } @else {
                  <div class="login-prompt">
                    <i class="bi bi-info-circle"></i>
                    <a routerLink="/auth/login">Sign in</a> to adopt this pet or book a visit.
                  </div>
                }
              }
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div style="text-align:center;padding:5rem;color:#6b7280;">
        <i class="bi bi-emoji-frown" style="font-size:3rem;"></i>
        <p>Animal not found.</p>
        <a routerLink="/animals" class="btn-outline">Back to Animals</a>
      </div>
    }
  `,
  styles: [`
    .detail-skeleton { display:grid; grid-template-columns:1fr 1fr; gap:2rem; max-width:1100px; margin:3rem auto; padding:0 1.5rem; }
    .detail-page { padding:3rem 0; }
    .container-custom { max-width:1100px; margin:0 auto; padding:0 1.5rem; }
    .breadcrumb-nav a { color:#14b8a6; text-decoration:none; font-size:0.9rem; display:flex; align-items:center; gap:0.4rem; margin-bottom:1.5rem; transition:color 0.2s; }
    .breadcrumb-nav a:hover { color:#f59e0b; }
    .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:2.5rem; align-items:start; }
    .detail-img-wrap { position:relative; border-radius:1rem; overflow:hidden; }
    .detail-img { width:100%; aspect-ratio:4/3; object-fit:cover; }
    .detail-no-img { aspect-ratio:4/3; background:rgba(15,118,110,0.1); display:flex; align-items:center; justify-content:center; font-size:6rem; color:rgba(15,118,110,0.3); }
    .detail-status { position:absolute; top:1rem; right:1rem; }
    .detail-info h1 { font-size:2.25rem; font-weight:800; color:#f9fafb; margin-bottom:1rem; }
    .meta-chips { display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.5rem; }
    .chip { background:rgba(31,41,55,0.8); border:1px solid rgba(255,255,255,0.08); border-radius:999px; padding:0.3rem 0.75rem; font-size:0.8rem; color:#9ca3af; display:flex; align-items:center; gap:0.35rem; }
    .detail-desc { color:#9ca3af; line-height:1.75; margin-bottom:1.5rem; }
    .action-card { background:rgba(31,41,55,0.6); border:1px solid rgba(255,255,255,0.07); border-radius:0.75rem; padding:1.5rem; }
    .action-card h3 { font-size:1.1rem; font-weight:700; color:#f9fafb; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem; }
    .appointment-form { display:flex; flex-direction:column; gap:0.75rem; }
    .w-full { width:100%; justify-content:center; }
    .success-banner { background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); color:#34d399; border-radius:0.75rem; padding:1rem 1.25rem; display:flex; align-items:center; gap:0.6rem; font-weight:500; }
    .login-prompt { background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); color:#93c5fd; border-radius:0.75rem; padding:1rem 1.25rem; font-size:0.9rem; }
    .login-prompt a { color:#60a5fa; }
    .mt-4 { margin-top:1rem; }
    .mb-3 { margin-bottom:0.75rem; }
    @media(max-width:768px) { .detail-grid { grid-template-columns:1fr; } }
  `]
})
export class AnimalDetailComponent implements OnInit {
  readonly animalService = inject(AnimalService);
  private adoptService = inject(AdoptionRequestService);
  private apptService = inject(AppointmentService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  animal = signal<AnimalResponse | null>(null);
  isLoggedIn = this.auth.isAuthenticated;
  requestSent = signal(false);
  adoptLoading = signal(false);
  appointmentSent = signal(false);
  apptLoading = signal(false);
  adoptMessage = '';
  apptDate = '';
  apptSlot = '';

  minDate() { return new Date().toISOString().split('T')[0]; }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.animalService.getById(id).subscribe({
      next: a => { this.animal.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  submitAdoptRequest() {
    if (!this.animal()) return;
    this.adoptLoading.set(true);
    this.adoptService.store(this.animal()!.id, this.adoptMessage).subscribe({
      next: () => { this.adoptLoading.set(false); this.requestSent.set(true); this.toast.success('Request submitted!', 'We\'ll review your adoption request soon.'); },
      error: (e) => { this.adoptLoading.set(false); this.toast.error('Error', e.error?.message ?? 'Could not submit request.'); }
    });
  }

  bookAppointment() {
    if (!this.apptDate || !this.apptSlot) { this.toast.warning('Fill the form', 'Please select a date and time slot.'); return; }
    this.apptLoading.set(true);
    this.apptService.book({ animalId: this.animal()!.id, date: this.apptDate, timeSlot: this.apptSlot }).subscribe({
      next: () => { this.apptLoading.set(false); this.appointmentSent.set(true); this.toast.success('Appointment booked!'); },
      error: (e) => { this.apptLoading.set(false); this.toast.error('Error', e.error?.message ?? 'Could not book.'); }
    });
  }
}
