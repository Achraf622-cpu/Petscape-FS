import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../../../core/services/animal.service';
import { SpeciesService } from '../../../core/services/species.service';
import { AnimalResponse, SpeciesResponse, Page } from '../../../models/models';

@Component({
  selector: 'app-animals-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="shop-layout">
      <!-- Sidebar Filters -->
      <aside class="shop-sidebar glass-card">
        <h2 class="sidebar-title"><i class="bi bi-funnel-fill text-teal-400"></i> Filters</h2>
        
        <div class="filter-section">
          <label>Search</label>
          <div class="search-wrap">
            <i class="bi bi-search search-icon"></i>
            <input type="text" [(ngModel)]="search" class="form-control" placeholder="Name or breed..." (input)="onFilterChange()" />
          </div>
        </div>

        <div class="filter-section">
          <label>Species</label>
          <div class="radio-list">
            <label class="radio-item">
              <input type="radio" name="species" value="" [(ngModel)]="selectedSpecies" (change)="onFilterChange()" />
              <span class="custom-radio"></span> All Species
            </label>
            @for (s of species(); track s.id) {
              <label class="radio-item">
                <input type="radio" name="species" [value]="s.id" [(ngModel)]="selectedSpecies" (change)="onFilterChange()" />
                <span class="custom-radio"></span> {{ s.name }}
              </label>
            }
          </div>
        </div>

        <div class="filter-section">
          <label>Status</label>
          <div class="radio-list">
            <label class="radio-item">
              <input type="radio" name="status" value="" [(ngModel)]="selectedStatus" (change)="onFilterChange()" />
              <span class="custom-radio"></span> All Status
            </label>
            <label class="radio-item">
              <input type="radio" name="status" value="AVAILABLE" [(ngModel)]="selectedStatus" (change)="onFilterChange()" />
              <span class="custom-radio"></span> Available
            </label>
            <label class="radio-item">
              <input type="radio" name="status" value="RESERVED" [(ngModel)]="selectedStatus" (change)="onFilterChange()" />
              <span class="custom-radio"></span> Reserved
            </label>
          </div>
        </div>

        <button class="btn-outline w-full mt-alert" (click)="resetFilters()">
          <i class="bi bi-arrow-counterclockwise"></i> Reset Filters
        </button>
      </aside>

      <!-- Main Content Area -->
      <main class="shop-main">
        <div class="shop-header">
          <div>
            <h1>Adopt a <span class="gradient-text">Pet</span></h1>
            <p class="text-muted-custom">Find your new best friend from our available animals.</p>
          </div>
          @if (!loading()) {
            <div class="results-count">Showing {{ page().totalElements }} results</div>
          }
        </div>

        @if (loading()) {
          <div class="shop-grid">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="skeleton" style="height:340px; border-radius:1rem;"></div>
            }
          </div>
        } @else if (page().content.length === 0) {
          <div class="empty-state">
            <i class="bi bi-search"></i>
            <h3>No pets match your criteria</h3>
            <p>Try clearing your filters or searching for something else.</p>
            <button class="btn-primary" (click)="resetFilters()">Clear All Filters</button>
          </div>
        } @else {
          <div class="shop-grid">
            @for (animal of page().content; track animal.id) {
              <a [routerLink]="['/animals', animal.id]" class="product-card"
                 (mouseenter)="startCycle(animal.id, animal.images.length)"
                 (mouseleave)="stopCycle(animal.id)">
                <div class="product-img-wrap">
                  @if (animal.images && animal.images.length > 0) {
                    @for (img of animal.images; track $index) {
                      <img
                        [src]="animalService.imageUrl(img)"
                        [alt]="animal.name"
                        class="product-img"
                        [class.active]="($index) === (activeIdx[animal.id] ?? 0)"
                      />
                    }
                  } @else {
                    <div class="no-img"><i class="bi bi-camera"></i></div>
                  }
                  <span class="status-badge shadow-sm" [class]="'badge-' + animal.status.toLowerCase()">{{ animal.status }}</span>
                  @if (animal.images && animal.images.length > 1) {
                    <div class="img-dots">
                      @for (img of animal.images; track $index) {
                        <span class="img-dot" [class.active-dot]="$index === (activeIdx[animal.id] ?? 0)"></span>
                      }
                    </div>
                  }
                  <div class="hover-overlay">
                    <button class="btn-quick-view">View Details <i class="bi bi-arrow-right"></i></button>
                  </div>
                </div>
                <div class="product-info">
                  <div class="product-category">{{ animal.speciesName }} · {{ animal.gender }}</div>
                  <h3 class="product-title">{{ animal.name }}</h3>
                  <div class="product-props">
                    <span><i class="bi bi-tag-fill"></i> {{ animal.breed || 'Mixed' }}</span>
                    <span><i class="bi bi-calendar-heart"></i> {{ animal.age }} yr{{ animal.age===1?'':'s' }}</span>
                  </div>
                </div>
              </a>
            }
          </div>

          <!-- Pagination -->
          @if (page().totalPages > 1) {
            <div class="pagination-wrap">
              <button class="page-btn" [disabled]="page().first" (click)="goToPage(currentPage()-1)">
                <i class="bi bi-chevron-left"></i>
              </button>
              @for (p of pageNumbers(); track p) {
                <button class="page-btn" [class.active]="p === currentPage()" (click)="goToPage(p)">{{ p+1 }}</button>
              }
              <button class="page-btn" [disabled]="page().last" (click)="goToPage(currentPage()+1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          }
        }
      </main>
    </div>
  `,
  styles: [`
    .shop-layout { display:flex; gap:2rem; max-width:1400px; margin:0 auto; padding:2rem 1.5rem; min-height:80vh; }
    
    /* Sidebar */
    .shop-sidebar { width:280px; flex-shrink:0; padding:1.5rem; height:fit-content; position:sticky; top:90px; }
    .sidebar-title { font-size:1.1rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.5rem; margin-bottom:1.5rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:1rem; }
    .filter-section { margin-bottom:1.5rem; }
    .filter-section label { display:block; color:#9ca3af; font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem; }
    .search-wrap { position:relative; }
    .search-icon { position:absolute; left:0.9rem; top:50%; transform:translateY(-50%); color:#6b7280; pointer-events:none; font-size:0.9rem; }
    .search-wrap .form-control { padding-left:2.5rem !important; background:rgba(17,24,39,0.5); border:1px solid rgba(255,255,255,0.08); font-size:0.9rem; }
    
    .radio-list { display:flex; flex-direction:column; gap:0.6rem; }
    .radio-item { display:flex; align-items:center; gap:0.6rem; color:#d1d5db; font-size:0.9rem; cursor:pointer; }
    .radio-item input { display:none; }
    .custom-radio { width:18px; height:18px; border:2px solid rgba(255,255,255,0.2); border-radius:50%; display:inline-block; position:relative; transition:all 0.2s; }
    .radio-item input:checked + .custom-radio { border-color:#14b8a6; }
    .radio-item input:checked + .custom-radio::after { content:''; width:8px; height:8px; background:#14b8a6; border-radius:50%; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); }
    .radio-item input:checked ~ span, .radio-item input:checked ~ color { color:#f9fafb; font-weight:600; }
    
    .mt-alert { margin-top:2rem; }
    .w-full { width:100%; justify-content:center; }
    
    /* Main Content */
    .shop-main { flex:1; min-width:0; }
    .shop-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:2rem; padding-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.05); }
    .shop-header h1 { font-size:2.5rem; font-weight:900; margin-bottom:0.25rem; }
    .gradient-text { background:linear-gradient(135deg,#14b8a6,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .text-muted-custom { color:#6b7280; font-size:0.95rem; }
    .results-count { color:#9ca3af; font-size:0.85rem; font-weight:600; background:rgba(255,255,255,0.05); padding:0.4rem 0.8rem; border-radius:999px; }
    
    /* Grid & Cards */
    .shop-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1.5rem; }
    .product-card { background:rgba(17,24,39,0.6); border:1px solid rgba(255,255,255,0.06); border-radius:1rem; overflow:hidden; text-decoration:none; display:flex; flex-direction:column; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .product-card:hover { transform:translateY(-8px); box-shadow:0 20px 40px -10px rgba(0,0,0,0.5); border-color:rgba(20,184,166,0.3); }
    
    .product-img-wrap { position:relative; height:240px; overflow:hidden; background:#111827; }
    .product-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 0.6s ease; }
    .product-img.active { opacity:1; }
    .product-card:hover .product-img.active { transform:scale(1.04); transition:opacity 0.6s ease, transform 0.6s ease; }
    .no-img { height:100%; display:flex; align-items:center; justify-content:center; font-size:3rem; color:#374151; background:rgba(255,255,255,0.02); }
    .img-dots { position:absolute; bottom:0.6rem; left:50%; transform:translateX(-50%); display:flex; gap:4px; z-index:3; }
    .img-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.4); transition:all 0.3s; }
    .img-dot.active-dot { background:white; width:18px; border-radius:3px; }
    
    .status-badge { position:absolute; top:1rem; left:1rem; padding:0.3rem 0.8rem; border-radius:999px; font-size:0.75rem; font-weight:700; z-index:2; backdrop-filter:blur(4px); letter-spacing:0.02em; }
    .badge-available { background:rgba(20,184,166,0.9); color:white; }
    .badge-reserved { background:rgba(245,158,11,0.9); color:white; }
    .badge-adopted { background:rgba(139,92,246,0.9); color:white; }
    
    .hover-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(17,24,39,0.9) 0%, transparent 60%); opacity:0; pointer-events:none; transition:opacity 0.3s; display:flex; align-items:flex-end; padding:1.25rem; }
    .product-card:hover .hover-overlay { opacity:1; }
    .btn-quick-view { width:100%; background:white; color:#111827; border:none; padding:0.75rem; border-radius:0.5rem; font-weight:700; font-size:0.9rem; cursor:pointer; transform:translateY(10px); transition:all 0.3s; display:flex; align-items:center; justify-content:center; gap:0.5rem; }
    .product-card:hover .btn-quick-view { transform:translateY(0); }
    
    .product-info { padding:1.25rem; display:flex; flex-direction:column; flex:1; background:linear-gradient(180deg, rgba(31,41,55,0.2) 0%, rgba(17,24,39,0.6) 100%); }
    .product-category { color:#14b8a6; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.4rem; }
    .product-title { color:#f9fafb; font-size:1.2rem; font-weight:800; margin:0 0 0.75rem; }
    
    .product-props { display:flex; gap:0.75rem; margin-top:auto; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.05); }
    .product-props span { color:#9ca3af; font-size:0.8rem; display:flex; align-items:center; gap:0.35rem; }
    .product-props i { color:#6b7280; font-size:0.9rem; }
    
    /* Empty & Pagination */
    .empty-state { text-align:center; padding:6rem 2rem; background:rgba(255,255,255,0.02); border-radius:1rem; border:1px dashed rgba(255,255,255,0.1); }
    .empty-state i { font-size:3rem; color:#4b5563; margin-bottom:1rem; display:block; }
    .empty-state h3 { color:#f9fafb; font-size:1.2rem; font-weight:700; margin-bottom:0.5rem; }
    .empty-state p { margin-bottom:1.5rem; color:#9ca3af; }
    
    .pagination-wrap { display:flex; justify-content:center; gap:0.4rem; margin-top:3rem; flex-wrap:wrap; }
    .page-btn { background:rgba(31,41,55,0.7); border:1px solid rgba(255,255,255,0.07); color:#9ca3af; border-radius:0.5rem; width:40px; height:40px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; font-size:0.9rem; font-weight:600; }
    .page-btn.active { background:linear-gradient(135deg,#0f766e,#14b8a6); border-color:transparent; color:white; }
    .page-btn:disabled { opacity:0.35; cursor:not-allowed; }
    .page-btn:not(:disabled):not(.active):hover { border-color:#14b8a6; color:#14b8a6; background:rgba(20,184,166,0.1); }
    
    @media (max-width: 900px) {
      .shop-layout { flex-direction:column; padding:1.5rem 1rem; }
      .shop-sidebar { width:100%; position:static; display:flex; flex-direction:row; flex-wrap:wrap; gap:1.5rem; align-items:flex-end; }
      .sidebar-title { width:100%; margin-bottom:0; padding-bottom:0.5rem; }
      .filter-section { margin-bottom:0; flex:1; min-width:200px; }
      .radio-list { flex-direction:row; flex-wrap:wrap; gap:1rem; }
      .mt-alert { margin-top:0; width:auto; }
      .shop-header { flex-direction:column; align-items:flex-start; gap:1rem; }
    }
  `]
})
export class AnimalsListComponent implements OnInit {
  readonly animalService = inject(AnimalService);
  private speciesService = inject(SpeciesService);

  loading = signal(true);
  species = signal<SpeciesResponse[]>([]);
  page = signal<Page<AnimalResponse>>({ content:[], totalElements:0, totalPages:0, number:0, size:12, first:true, last:true });
  currentPage = signal(0);

  search = '';
  selectedSpecies = '';
  selectedStatus = '';

  pageNumbers() {
    return Array.from({ length: Math.min(this.page().totalPages, 7) }, (_, i) => i);
  }

  ngOnInit() {
    this.speciesService.getAll().subscribe(s => this.species.set(s));
    this.loadPage(0);
  }

  loadPage(p: number) {
    this.loading.set(true);
    this.currentPage.set(p);
    this.animalService.getAll({
      search: this.search || undefined,
      speciesId: this.selectedSpecies ? Number(this.selectedSpecies) : undefined,
      status: this.selectedStatus || undefined,
      page: p, size: 12
    }).subscribe({
      next: data => { this.page.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange() { this.loadPage(0); }
  goToPage(p: number) { this.loadPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  resetFilters() { this.search = ''; this.selectedSpecies = ''; this.selectedStatus = ''; this.loadPage(0); }

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
