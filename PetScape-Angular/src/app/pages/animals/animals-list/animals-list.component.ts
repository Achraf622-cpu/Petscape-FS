import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../../../core/services/animal.service';
import { SpeciesService } from '../../../core/services/species.service';
import { AnimalResponse, Species, Page } from '../../../models/models';

@Component({
  selector: 'app-animals-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './animals-list.component.html',
  styleUrl: './animals-list.component.css',
})
export class AnimalsListComponent implements OnInit {
  readonly animalService = inject(AnimalService);
  private speciesService = inject(SpeciesService);

  loading = signal(true);
  species = signal<Species[]>([]);
  page = signal<Page<AnimalResponse>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 12,
    first: true,
    last: true,
  });
  currentPage = signal(0);

  search = '';
  selectedSpecies = '';
  selectedStatus = '';

  pageNumbers() {
    return Array.from({ length: Math.min(this.page().totalPages, 7) }, (_, i) => i);
  }

  ngOnInit() {
    this.speciesService.getAll().subscribe((s) => this.species.set(s));
    this.loadPage(0);
  }

  loadPage(p: number) {
    this.loading.set(true);
    this.currentPage.set(p);
    this.animalService
      .getAll({
        search: this.search || undefined,
        species: this.selectedSpecies || undefined,
        status: this.selectedStatus || undefined,
        page: p,
        size: 12,
      })
      .subscribe({
        next: (data) => {
          this.page.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onFilterChange() {
    this.loadPage(0);
  }
  goToPage(p: number) {
    this.loadPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  resetFilters() {
    this.search = '';
    this.selectedSpecies = '';
    this.selectedStatus = '';
    this.loadPage(0);
  }

  // ── Image cycling ──────────────────────────────────────────────────────────
  activeIdx: Record<number, number> = {};
  private cycleTimers: Record<number, ReturnType<typeof setInterval>> = {};

  startCycle(id: number, count: number) {
    if (count <= 1) return;
    this.activeIdx[id] = 0;
    this.cycleTimers[id] = setInterval(() => {
      this.activeIdx[id] = ((this.activeIdx[id] ?? 0) + 1) % count;
    }, 2500);
  }

  stopCycle(id: number) {
    clearInterval(this.cycleTimers[id]);
    delete this.cycleTimers[id];
    this.activeIdx[id] = 0;
  }
}
