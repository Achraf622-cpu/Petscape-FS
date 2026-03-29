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
  templateUrl: './animal-detail.component.html',
  styleUrl: './animal-detail.component.css',
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

  minDate() {
    return new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.animalService.getById(id).subscribe({
      next: (a) => {
        this.animal.set(a);
        this.images.set(a.images ?? []);
        this.loading.set(false);
        if (a.images && a.images.length > 1) this.startAutoPlay();
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  setImg(i: number) {
    this.activeImg.set(i);
  }
  prev(e: Event) {
    e.stopPropagation();
    this.activeImg.set((this.activeImg() - 1 + this.images().length) % this.images().length);
  }
  next(e: Event) {
    e.stopPropagation();
    this.activeImg.set((this.activeImg() + 1) % this.images().length);
  }

  private startAutoPlay() {
    this.autoTimer = setInterval(() => {
      this.activeImg.set((this.activeImg() + 1) % this.images().length);
    }, 4000);
  }
  private stopAutoPlay() {
    clearInterval(this.autoTimer);
  }

  openLightbox(idx: number) {
    this.lightboxIdx.set(idx);
    this.lightboxOpen.set(true);
    this.stopAutoPlay();
  }
  closeLightbox() {
    this.lightboxOpen.set(false);
    if (this.images().length > 1) this.startAutoPlay();
  }
  lbPrev(e: Event) {
    e.stopPropagation();
    this.lightboxIdx.set((this.lightboxIdx() - 1 + this.images().length) % this.images().length);
  }
  lbNext(e: Event) {
    e.stopPropagation();
    this.lightboxIdx.set((this.lightboxIdx() + 1) % this.images().length);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.lightboxOpen()) return;
    if (e.key === 'Escape') this.closeLightbox();
    if (e.key === 'ArrowLeft')
      this.lightboxIdx.set((this.lightboxIdx() - 1 + this.images().length) % this.images().length);
    if (e.key === 'ArrowRight')
      this.lightboxIdx.set((this.lightboxIdx() + 1) % this.images().length);
  }

  submitAdoptRequest() {
    if (!this.animal()) return;
    this.adoptLoading.set(true);
    this.adoptService.store(this.animal()!.id, this.adoptMessage).subscribe({
      next: () => {
        this.adoptLoading.set(false);
        this.requestSent.set(true);
        this.toast.success('Request submitted!', "We'll review your adoption request soon.");
      },
      error: (e) => {
        this.adoptLoading.set(false);
        this.toast.error('Error', e.error?.message ?? 'Could not submit request.');
      },
    });
  }

  bookAppointment() {
    if (!this.apptDate || !this.apptSlot) {
      this.toast.warning('Fill the form', 'Please select a date and time slot.');
      return;
    }
    this.apptLoading.set(true);
    this.apptService
      .book({ animalId: this.animal()!.id, date: this.apptDate, timeSlot: this.apptSlot })
      .subscribe({
        next: () => {
          this.apptLoading.set(false);
          this.appointmentSent.set(true);
          this.toast.success('Appointment booked!');
        },
        error: (e) => {
          this.apptLoading.set(false);
          this.toast.error('Error', e.error?.message ?? 'Could not book.');
        },
      });
  }
}
