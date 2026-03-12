import { Component, OnInit, OnDestroy, signal, inject, HostListener } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../../../core/services/animal.service';
import { AdoptionRequestService } from '../../../core/services/adoption-request.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AnimalResponse } from '../../../models/models';

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
          <nav class="breadcrumb-nav">
            <a routerLink="/animals"><i class="bi bi-arrow-left"></i> Back to Animals</a>
          </nav>

          <div class="detail-grid">
            <!-- ── Image Gallery ── -->
            <div class="gallery-col">
              <!-- Main Carousel -->
              <div class="carousel-wrap" (click)="openLightbox(activeImg())">
                @if (images().length > 0) {
                  @for (img of images(); track $index) {
                    <img
                      [src]="animalService.imageUrl(img)"
                      [alt]="animal()!.name"
                      class="carousel-img"
                      [class.visible]="$index === activeImg()"
                    />
                  }
                  @if (images().length > 1) {
                    <button class="carr-btn carr-prev" (click)="prev($event)"><i class="bi bi-chevron-left"></i></button>
                    <button class="carr-btn carr-next" (click)="next($event)"><i class="bi bi-chevron-right"></i></button>
                  }
                  <div class="zoom-hint"><i class="bi bi-zoom-in"></i></div>
                } @else {
                  <div class="no-img-big"><i class="bi bi-heart-fill"></i></div>
                }
                <span class="status-badge" [class]="'badge-' + animal()!.status.toLowerCase()">
                  {{ animal()!.status }}
                </span>
              </div>

              <!-- Thumbnail Strip -->
              @if (images().length > 1) {
                <div class="thumb-strip">
                  @for (img of images(); track $index) {
                    <button class="thumb-btn" [class.active-thumb]="$index === activeImg()" (click)="setImg($index)">
                      <img [src]="animalService.imageUrl(img)" [alt]="'photo ' + ($index+1)" />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- ── Info ── -->
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
                  @if (!requestSent()) {
                    <div class="action-card">
                      <h3><i class="bi bi-heart"></i> Adopt {{ animal()!.name }}</h3>
                      <textarea [(ngModel)]="adoptMessage" class="form-control mb-3" rows="3"
                        placeholder="Tell us why you'd be a great owner..."></textarea>
                      <button class="btn-primary w-full" (click)="submitAdoptRequest()" [disabled]="adoptLoading()">
                        @if (adoptLoading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                        Submit Adoption Request
                      </button>
                    </div>
                  } @else {
                    <div class="success-banner">
                      <i class="bi bi-check-circle-fill"></i>
                      Adoption request submitted! We'll review it shortly.
                    </div>
                  }

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
                          @if (apptLoading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="success-banner mt-4"><i class="bi bi-check-circle-fill"></i> Appointment booked!</div>
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

      <!-- ── Lightbox ── -->
      @if (lightboxOpen()) {
        <div class="lightbox-overlay" (click)="closeLightbox()">
          <button class="lb-close" (click)="closeLightbox()"><i class="bi bi-x-lg"></i></button>
          @if (images().length > 1) {
            <button class="lb-arr lb-prev" (click)="lbPrev($event)"><i class="bi bi-chevron-left"></i></button>
            <button class="lb-arr lb-next" (click)="lbNext($event)"><i class="bi bi-chevron-right"></i></button>
          }
          <img
            [src]="animalService.imageUrl(images()[lightboxIdx()])"
            [alt]="animal()!.name"
            class="lb-img"
            (click)="$event.stopPropagation()"
          />
          <div class="lb-counter">{{ lightboxIdx() + 1 }} / {{ images().length }}</div>
        </div>
      }
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

    /* Gallery */
    .gallery-col { display:flex; flex-direction:column; gap:0.75rem; }
    .carousel-wrap { position:relative; border-radius:1rem; overflow:hidden; aspect-ratio:4/3; background:#0f172a; cursor:zoom-in; box-shadow:inset 0 0 40px rgba(0,0,0,0.6); }
    .carousel-img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; opacity:0; transition:opacity 0.5s ease; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5)); }
    .carousel-img.visible { opacity:1; }
    .no-img-big { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:6rem; color:rgba(15,118,110,0.3); }

    .carr-btn { position:absolute; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); border:none; color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:5; transition:all 0.2s; font-size:1.1rem; }
    .carr-btn:hover { background:rgba(20,184,166,0.8); }
    .carr-prev { left:0.75rem; }
    .carr-next { right:0.75rem; }
    .zoom-hint { position:absolute; bottom:0.75rem; right:0.75rem; background:rgba(0,0,0,0.5); color:white; padding:0.3rem 0.6rem; border-radius:0.5rem; font-size:0.75rem; backdrop-filter:blur(4px); opacity:0; transition:opacity 0.3s; pointer-events:none; }
    .carousel-wrap:hover .zoom-hint { opacity:1; }

    .status-badge { position:absolute; top:1rem; right:1rem; padding:0.35rem 0.9rem; border-radius:999px; font-size:0.75rem; font-weight:700; backdrop-filter:blur(4px); }
    .badge-available { background:rgba(20,184,166,0.85); color:white; }
    .badge-reserved { background:rgba(245,158,11,0.85); color:white; }
    .badge-adopted { background:rgba(139,92,246,0.85); color:white; }

    .thumb-strip { display:flex; gap:0.5rem; overflow-x:auto; padding-bottom:4px; }
    .thumb-btn { border:2px solid transparent; border-radius:0.5rem; overflow:hidden; width:72px; height:60px; flex-shrink:0; padding:0; cursor:pointer; transition:border-color 0.2s; background:none; }
    .thumb-btn img { width:100%; height:100%; object-fit:cover; }
    .thumb-btn.active-thumb { border-color:#14b8a6; }

    /* Info */
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

    /* Lightbox */
    .lightbox-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:9999; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.2s ease; }
    .lb-img { max-width:90vw; max-height:90vh; object-fit:contain; border-radius:0.5rem; box-shadow:0 25px 60px rgba(0,0,0,0.6); }
    .lb-close { position:fixed; top:1rem; right:1rem; background:rgba(255,255,255,0.1); border:none; color:white; width:44px; height:44px; border-radius:50%; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s; }
    .lb-close:hover { background:rgba(239,68,68,0.6); }
    .lb-arr { position:fixed; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.1); border:none; color:white; width:52px; height:52px; border-radius:50%; font-size:1.4rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
    .lb-arr:hover { background:rgba(20,184,166,0.7); }
    .lb-prev { left:1rem; }
    .lb-next { right:1rem; }
    .lb-counter { position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%); color:rgba(255,255,255,0.6); font-size:0.85rem; background:rgba(0,0,0,0.4); padding:0.3rem 0.9rem; border-radius:999px; }

    @media(max-width:768px) { .detail-grid { grid-template-columns:1fr; } .detail-skeleton { grid-template-columns:1fr; } }
  `]
})
export class AnimalDetailComponent implements OnInit, OnDestroy {
  readonly animalService = inject(AnimalService);
  private adoptService = inject(AdoptionRequestService);
  private apptService = inject(AppointmentService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  animal = signal<AnimalResponse | null>(null);
  images = signal<string[]>([]);
  activeImg = signal(0);
  isLoggedIn = this.auth.isAuthenticated;
  requestSent = signal(false);
  adoptLoading = signal(false);
  appointmentSent = signal(false);
  apptLoading = signal(false);
  adoptMessage = '';
  apptDate = '';
  apptSlot = '';

  lightboxOpen = signal(false);
  lightboxIdx = signal(0);
  private autoTimer?: ReturnType<typeof setInterval>;

  minDate() { return new Date().toISOString().split('T')[0]; }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.animalService.getById(id).subscribe({
      next: a => {
        this.animal.set(a);
        this.images.set(a.images ?? []);
        this.loading.set(false);
        if (a.images && a.images.length > 1) this.startAutoPlay();
      },
      error: () => this.loading.set(false)
    });
  }

  ngOnDestroy() { this.stopAutoPlay(); }

  setImg(i: number) { this.activeImg.set(i); }
  prev(e: Event) { e.stopPropagation(); this.activeImg.set((this.activeImg() - 1 + this.images().length) % this.images().length); }
  next(e: Event) { e.stopPropagation(); this.activeImg.set((this.activeImg() + 1) % this.images().length); }

  private startAutoPlay() {
    this.autoTimer = setInterval(() => {
      this.activeImg.set((this.activeImg() + 1) % this.images().length);
    }, 4000);
  }
  private stopAutoPlay() { clearInterval(this.autoTimer); }

  openLightbox(idx: number) { this.lightboxIdx.set(idx); this.lightboxOpen.set(true); this.stopAutoPlay(); }
  closeLightbox() { this.lightboxOpen.set(false); if (this.images().length > 1) this.startAutoPlay(); }
  lbPrev(e: Event) { e.stopPropagation(); this.lightboxIdx.set((this.lightboxIdx() - 1 + this.images().length) % this.images().length); }
  lbNext(e: Event) { e.stopPropagation(); this.lightboxIdx.set((this.lightboxIdx() + 1) % this.images().length); }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.lightboxOpen()) return;
    if (e.key === 'Escape') this.closeLightbox();
    if (e.key === 'ArrowLeft') this.lightboxIdx.set((this.lightboxIdx() - 1 + this.images().length) % this.images().length);
    if (e.key === 'ArrowRight') this.lightboxIdx.set((this.lightboxIdx() + 1) % this.images().length);
  }

  submitAdoptRequest() {
    if (!this.animal()) return;
    this.adoptLoading.set(true);
    this.adoptService.store(this.animal()!.id, this.adoptMessage).subscribe({
      next: () => { this.adoptLoading.set(false); this.requestSent.set(true); this.toast.success('Request submitted!', "We'll review your adoption request soon."); },
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
