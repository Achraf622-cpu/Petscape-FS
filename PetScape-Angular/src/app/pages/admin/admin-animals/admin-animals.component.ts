import { Component, OnInit, signal, inject } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { AnimalService } from '../../../core/services/animal.service';
import { SpeciesService } from '../../../core/services/species.service';
import { ToastService } from '../../../core/services/toast.service';
import { AnimalResponse, Page, SpeciesResponse } from '../../../models/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-animals',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-enter">
      <div class="page-hdr">
        <h2 class="admin-page-title"><i class="bi bi-heart-fill"></i> Animals Management</h2>
        <button class="btn-primary" (click)="openCreate()">
          <i class="bi bi-plus-lg"></i> Add Animal
        </button>
      </div>

      <!-- ── Create / Edit Modal ── -->
      @if (showForm()) {
        <div class="modal-backdrop" (click)="closeForm()"></div>
        <div class="modal-panel glass-card">
          <div class="modal-header">
            <h3>{{ editing() ? 'Edit Animal' : 'Add New Animal' }}</h3>
            <button class="close-btn" (click)="closeForm()"><i class="bi bi-x-lg"></i></button>
          </div>
          <form (ngSubmit)="submitForm()" class="animal-form">
            <div class="form-grid">
              <div class="field">
                <label>Name *</label>
                <input class="form-control" [(ngModel)]="form.name" name="name" required placeholder="e.g. Luna" />
              </div>
              <div class="field">
                <label>Species *</label>
                <select class="form-control" [(ngModel)]="form.speciesId" name="speciesId" required>
                  <option value="">Select species</option>
                  @for (s of speciesList(); track s.id) {
                    <option [value]="s.id">{{ s.name }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label>Breed *</label>
                <input class="form-control" [(ngModel)]="form.breed" name="breed" required placeholder="e.g. Golden Retriever" />
              </div>
              <div class="field">
                <label>Age (years) *</label>
                <input class="form-control" type="number" [(ngModel)]="form.age" name="age" required min="0" />
              </div>
              <div class="field">
                <label>Status *</label>
                <select class="form-control" [(ngModel)]="form.status" name="status" required>
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="ADOPTED">Adopted</option>
                </select>
              </div>
              <div class="field">
                <label>Location *</label>
                <input class="form-control" [(ngModel)]="form.location" name="location" required placeholder="e.g. Casablanca" />
              </div>
            </div>
            <div class="field full-width">
              <label>Description *</label>
              <textarea class="form-control" [(ngModel)]="form.description" name="description" required rows="3"
                        placeholder="Describe the animal..."></textarea>
            </div>
            <div class="field full-width">
              <label>Photo</label>
              <div class="file-upload">
                <input type="file" accept="image/*" (change)="onFileChange($event)" id="animalImage" />
                <label for="animalImage" class="file-label">
                  <i class="bi bi-cloud-arrow-up"></i>
                  {{ selectedFileName() || 'Choose image...' }}
                </label>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-outline" (click)="closeForm()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="saving()">
                @if (saving()) {
                  <span class="spinner-border spinner-border-sm me-1"></span> Saving...
                } @else {
                  <i class="bi bi-check-lg"></i> {{ editing() ? 'Update' : 'Create' }}
                }
              </button>
            </div>
          </form>
        </div>
      }

      <!-- ── Animals Table ── -->
      @if (loading()) {
        <div class="skeleton" style="height:400px;border-radius:0.75rem;"></div>
      } @else {
        <div class="table-wrap glass-card">
          <table class="table table-hover mb-0">
            <thead>
              <tr><th>#</th><th>Image</th><th>Name</th><th>Species</th><th>Breed</th><th>Age</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              @for (a of page().content; track a.id) {
                <tr>
                  <td class="text-muted-custom">{{ a.id }}</td>
                  <td>
                    @if (a.image) {
                      <img [src]="animalService.imageUrl(a.image)" class="thumb" [alt]="a.name" />
                    } @else {
                      <div class="thumb-placeholder"><i class="bi bi-image"></i></div>
                    }
                  </td>
                  <td><strong>{{ a.name }}</strong></td>
                  <td>{{ a.speciesName }}</td>
                  <td class="text-muted-custom">{{ a.breed }}</td>
                  <td>{{ a.age }}y</td>
                  <td><span class="status-badge" [class]="'badge-' + a.status.toLowerCase()">{{ a.status }}</span></td>
                  <td class="action-cell">
                    <button class="btn-action edit" (click)="openEdit(a)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-action danger" (click)="deleteAnimal(a.id)" [disabled]="deleting() === a.id" title="Delete">
                      <i class="bi bi-trash"></i>
                    </button>
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
  `,
  styles: [`
    .admin-page-title { font-size:1.5rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.6rem; margin-bottom:0; }
    .admin-page-title i { color:#a78bfa; }
    .page-hdr { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem; }

    /* Thumbnail */
    .thumb { width:40px; height:40px; border-radius:0.5rem; object-fit:cover; }
    .thumb-placeholder { width:40px; height:40px; border-radius:0.5rem; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; color:#4b5563; }

    /* Modal */
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:100; }
    .modal-panel { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:101; width:90%; max-width:620px; max-height:90vh; overflow-y:auto; padding:2rem; animation:fadeIn 0.2s ease; }
    .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
    .modal-header h3 { font-size:1.2rem; font-weight:700; color:#f9fafb; margin:0; }
    .close-btn { background:none; border:none; color:#6b7280; font-size:1.2rem; cursor:pointer; padding:0.25rem; }
    .close-btn:hover { color:#f87171; }

    /* Form */
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; }
    .field { display:flex; flex-direction:column; gap:0.3rem; }
    .field label { color:#9ca3af; font-size:0.8rem; font-weight:500; }
    .full-width { margin-bottom:1rem; }
    .file-upload { position:relative; }
    .file-upload input[type="file"] { position:absolute; opacity:0; width:0; height:0; }
    .file-label { display:flex; align-items:center; gap:0.5rem; padding:0.6rem 1rem; background:rgba(31,41,55,0.8); border:1px dashed rgba(255,255,255,0.15); border-radius:0.5rem; color:#9ca3af; font-size:0.85rem; cursor:pointer; transition:border-color 0.2s; }
    .file-label:hover { border-color:#14b8a6; color:#14b8a6; }
    .form-actions { display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; }

    /* Table */
    .table-wrap { overflow-x:auto; }
    .action-cell { white-space:nowrap; }
    .btn-action { border:none; border-radius:0.4rem; padding:0.35rem 0.6rem; cursor:pointer; font-size:0.8rem; font-weight:600; display:inline-flex; align-items:center; gap:0.3rem; margin-right:0.3rem; transition:all 0.2s; }
    .edit { background:rgba(14,165,233,0.12); color:#38bdf8; border:1px solid rgba(14,165,233,0.3); }
    .edit:hover { background:rgba(14,165,233,0.22); }
    .danger { background:rgba(239,68,68,0.12); color:#f87171; border:1px solid rgba(239,68,68,0.3); }
    .danger:hover { background:rgba(239,68,68,0.22); }
    .btn-action:disabled { opacity:0.5; cursor:not-allowed; }
    .pag-wrap { display:flex; align-items:center; gap:0.75rem; justify-content:center; margin-top:1.25rem; }
    .page-btn { background:rgba(31,41,55,0.7); border:1px solid rgba(255,255,255,0.07); color:#9ca3af; border-radius:0.5rem; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .page-btn:disabled { opacity:0.35; cursor:not-allowed; }
    .page-info { color:#6b7280; font-size:0.875rem; }
    .text-muted-custom { color:#6b7280; }
    @media(max-width:600px) { .form-grid { grid-template-columns:1fr; } .modal-panel { width:95%; padding:1.25rem; } }
  `]
})
export class AdminAnimalsComponent implements OnInit {
  readonly animalService = inject(AnimalService);
  private adminService = inject(AdminService);
  private speciesService = inject(SpeciesService);
  private toast = inject(ToastService);

  loading = signal(true);
  deleting = signal<number | null>(null);
  page = signal<Page<AnimalResponse>>({ content:[], totalElements:0, totalPages:0, number:0, size:15, first:true, last:true });

  // Form state
  showForm = signal(false);
  editing = signal<number | null>(null);
  saving = signal(false);
  speciesList = signal<SpeciesResponse[]>([]);
  selectedFileName = signal('');
  selectedFile: File | null = null;

  form = {
    name: '',
    speciesId: '',
    breed: '',
    age: 0,
    description: '',
    status: 'AVAILABLE',
    location: ''
  };

  ngOnInit() {
    this.load(0);
    this.speciesService.getAll().subscribe(s => this.speciesList.set(s));
  }

  load(p: number) {
    this.loading.set(true);
    this.adminService.getAnimals(p).subscribe({
      next: data => { this.page.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() {
    this.resetForm();
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(animal: AnimalResponse) {
    this.form = {
      name: animal.name,
      speciesId: String(animal.speciesId),
      breed: animal.breed,
      age: animal.age,
      description: animal.description,
      status: animal.status,
      location: ''  // location not in AnimalResponse, leave empty
    };
    this.selectedFile = null;
    this.selectedFileName.set('');
    this.editing.set(animal.id);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editing.set(null);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.selectedFileName.set(this.selectedFile.name);
    }
  }

  submitForm() {
    if (!this.form.name || !this.form.speciesId || !this.form.breed || !this.form.description || !this.form.status) {
      this.toast.error('Validation', 'Please fill in all required fields.');
      return;
    }

    this.saving.set(true);
    const fd = new FormData();
    fd.append('name', this.form.name);
    fd.append('speciesId', this.form.speciesId);
    fd.append('breed', this.form.breed);
    fd.append('age', String(this.form.age));
    fd.append('description', this.form.description);
    fd.append('status', this.form.status);
    fd.append('location', this.form.location || 'N/A');
    if (this.selectedFile) {
      fd.append('image', this.selectedFile);
    }

    const editId = this.editing();
    const obs$ = editId
      ? this.animalService.update(editId, fd)
      : this.animalService.create(fd);

    obs$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(editId ? 'Animal updated' : 'Animal created');
        this.closeForm();
        this.load(this.page().number);
      },
      error: (e) => {
        this.saving.set(false);
        this.toast.error('Error', e.error?.message || 'Could not save animal.');
      }
    });
  }

  deleteAnimal(id: number) {
    if (!confirm('Delete this animal? This cannot be undone.')) return;
    this.deleting.set(id);
    this.animalService.delete(id).subscribe({
      next: () => { this.deleting.set(null); this.toast.success('Animal deleted'); this.load(this.page().number); },
      error: (e) => { this.deleting.set(null); this.toast.error('Error', e.error?.message); }
    });
  }

  private resetForm() {
    this.form = { name: '', speciesId: '', breed: '', age: 0, description: '', status: 'AVAILABLE', location: '' };
    this.selectedFile = null;
    this.selectedFileName.set('');
  }
}
