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
              <label>Photos (up to 10 images — JPG, PNG, WEBP, GIF)</label>
              
              <div class="drop-zone" 
                   [class.drag-over]="isDragOver()"
                   (dragover)="onDragOver($event)" 
                   (dragleave)="onDragLeave($event)" 
                   (drop)="onDrop($event)"
                   (click)="fileInput.click()">
                <div class="drop-content">
                  <i class="bi bi-cloud-arrow-up drop-icon"></i>
                  <p class="drop-text">Click to browse or drag & drop photos here</p>
                  <span class="drop-hint">You can add multiple files incrementally. Max 10.</span>
                </div>
                <!-- Hidden input -->
                <input type="file" #fileInput id="animalImages" accept="image/*" multiple (change)="onFileSelected($event)" hidden />
              </div>

              @if (selectedPreviews().length > 0) {
                <div class="thumbnail-grid mt-3">
                  @for (p of selectedPreviews(); track $index) {
                    <div class="thumb-card">
                      <img [src]="p" alt="preview" />
                      <button type="button" class="btn-remove" (click)="removeNewImage($index, $event)"><i class="bi bi-x"></i></button>
                    </div>
                  }
                </div>
              }

              @if (editing() && existingImages().length > 0) {
                <div class="existing-section mt-4 pt-3" style="border-top:1px solid rgba(255,255,255,0.05);">
                  <h6 class="text-muted-custom mb-3" style="font-size:0.9rem;"><i class="bi bi-images me-2"></i>Existing Photos (will be kept unless removed)</h6>
                  <div class="thumbnail-grid" style="margin-top:0;">
                    @for (img of existingImages(); track $index) {
                      <div class="thumb-card existing-thumb">
                        <img [src]="animalService.imageUrl(img)" alt="existing" />
                        <button type="button" class="btn-remove" (click)="removeExistingImage($index, $event)"><i class="bi bi-x"></i></button>
                      </div>
                    }
                  </div>
                </div>
              }
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
                    <div class="avatar-stack">
                      @if (a.images && a.images.length > 0) {
                        @for (img of a.images.slice(0,3); track $index) {
                          <img [src]="animalService.imageUrl(img)" class="thumb" style="width:40px;height:40px;" [alt]="a.name" />
                        }
                        @if (a.images.length > 3) {
                          <div class="avatar-count">+{{ a.images.length - 3 }}</div>
                        }
                      } @else {
                        <div class="avatar-count" style="margin-left:0; border:none;"><i class="bi bi-image" style="color:#6b7280; font-size:1.1rem;"></i></div>
                      }
                    </div>
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
    .thumb { width:44px; height:44px; border-radius:0.5rem; object-fit:cover; }
    .thumb-placeholder { width:44px; height:44px; border-radius:0.5rem; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; color:#4b5563; }
    .img-count { font-size:0.7rem; color:#9ca3af; margin-left:4px; vertical-align:middle; }

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
    /* File Upload Drop Zone */
    .drop-zone { border:2px dashed rgba(255,255,255,0.15); border-radius:1rem; padding:2.5rem 1rem; text-align:center; background:rgba(31,41,55,0.4); cursor:pointer; transition:all 0.2s ease; margin-bottom:0.5rem; }
    .drop-zone:hover, .drop-zone.drag-over { border-color:#14b8a6; background:rgba(20,184,166,0.05); }
    .drop-icon { font-size:2.5rem; color:#9ca3af; margin-bottom:0.5rem; display:inline-block; transition:color 0.2s; }
    .drop-zone:hover .drop-icon, .drop-zone.drag-over .drop-icon { color:#14b8a6; }
    .drop-text { color:#f9fafb; font-weight:600; font-size:1.05rem; margin-bottom:0.25rem; }
    .drop-hint { color:#6b7280; font-size:0.85rem; }
    
    .thumbnail-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:1rem; margin-top:1rem; }
    .thumb-card { position:relative; aspect-ratio:1; border-radius:0.75rem; overflow:hidden; border:2px solid rgba(255,255,255,0.1); background:#111827; }
    .thumb-card img { width:100%; height:100%; object-fit:cover; }
    .existing-thumb { border-color: rgba(20,184,166,0.3); }
    .btn-remove { position:absolute; top:4px; right:4px; width:24px; height:24px; border-radius:50%; background:rgba(239,68,68,0.9); color:white; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1.1rem; transition:transform 0.2s; backdrop-filter:blur(4px); }
    .btn-remove:hover { transform:scale(1.1); background:#ef4444; }
    .mt-3 { margin-top:1rem; }
    .existing-note { color:#9ca3af; font-size:0.85rem; margin-top:0.75rem; display:flex; align-items:center; gap:0.4rem; padding:0.75rem; background:rgba(255,255,255,0.03); border-radius:0.5rem; }
    .form-actions { display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid rgba(255,255,255,0.05); }

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
  selectedFiles = signal<File[]>([]);
  selectedPreviews = signal<string[]>([]);
  existingImages = signal<string[]>([]);
  isDragOver = signal(false);

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

  // --- File Upload & Drag-and-Drop ---
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
    input.value = ''; // Reset so same file can be selected again if needed
  }

  private handleFiles(files: File[]) {
    const maxFiles = 10;
    const currentCount = this.selectedFiles().length;
    let newFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (currentCount + newFiles.length > maxFiles) {
      this.toast.warning('Limit Reached', `You can only upload up to ${maxFiles} images.`);
      newFiles = newFiles.slice(0, maxFiles - currentCount);
    }
    
    if (newFiles.length === 0) return;

    this.selectedFiles.update(curr => [...curr, ...newFiles]);
    
    // Generate previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedPreviews.update(curr => [...curr, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  removeNewImage(index: number, event: Event) {
    event.stopPropagation();
    this.selectedFiles.update(curr => {
      const copy = [...curr];
      copy.splice(index, 1);
      return copy;
    });
    this.selectedPreviews.update(curr => {
      const copy = [...curr];
      copy.splice(index, 1);
      return copy;
    });
  }
  // ------------------------------------

  removeExistingImage(index: number, event: Event) {
    event.stopPropagation();
    this.existingImages.update(curr => {
      const copy = [...curr];
      copy.splice(index, 1);
      return copy;
    });
  }
  // ------------------------------------

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
      location: ''
    };
    this.selectedFiles.set([]);
    this.selectedPreviews.set([]);
    this.existingImages.set(animal.images || []);
    this.editing.set(animal.id);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editing.set(null);
  }

  submitForm() {
    if (!this.form.name || !this.form.speciesId || !this.form.breed || !this.form.description || !this.form.status || this.form.age === null) {
      this.toast.error('Validation', 'Please fill in all required fields (including age).');
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
    
    // Append existing images that are kept
    this.existingImages().forEach(img => fd.append('existingImages', img));

    // Append each selected file under the 'images' key
    this.selectedFiles().forEach(f => fd.append('images', f));

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
        console.error('[ADMIN ANIMALS] Save Error:', e);
        const msg = e.error?.message || (e.error?.errors ? Object.values(e.error.errors).join(', ') : 'Could not save animal.');
        this.toast.error('Error', msg);
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
    this.selectedFiles.set([]);
    this.selectedPreviews.set([]);
  }
}
