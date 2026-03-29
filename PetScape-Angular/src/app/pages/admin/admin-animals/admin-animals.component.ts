import { Component, OnInit, signal, inject } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { AnimalService } from '../../../core/services/animal.service';
import { SpeciesService } from '../../../core/services/species.service';
import { ToastService } from '../../../core/services/toast.service';
import { AnimalResponse, Page } from '../../../models/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-animals',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-animals.component.html',
  styleUrl: './admin-animals.component.css',
})
export class AdminAnimalsComponent implements OnInit {
  readonly animalService = inject(AnimalService);
  private adminService = inject(AdminService);
  private speciesService = inject(SpeciesService);
  private toast = inject(ToastService);

  loading = signal(true);
  deleting = signal<number | null>(null);
  page = signal<Page<AnimalResponse>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 15,
    first: true,
    last: true,
  });

  // Form state
  showForm = signal(false);
  editing = signal<number | null>(null);
  saving = signal(false);
  speciesList = signal<string[]>([]);
  selectedFiles = signal<File[]>([]);
  selectedPreviews = signal<string[]>([]);
  existingImages = signal<string[]>([]);
  isDragOver = signal(false);

  form = {
    name: '',
    species: '',
    breed: '',
    age: 0,
    description: '',
    status: 'AVAILABLE',
    location: '',
  };

  ngOnInit() {
    this.load(0);
    this.speciesService.getAll().subscribe((s) => this.speciesList.set(s));
  }

  load(p: number) {
    this.loading.set(true);
    this.adminService.getAnimals(p).subscribe({
      next: (data) => {
        this.page.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
    let newFiles = files.filter((f) => f.type.startsWith('image/'));

    if (currentCount + newFiles.length > maxFiles) {
      this.toast.warning('Limit Reached', `You can only upload up to ${maxFiles} images.`);
      newFiles = newFiles.slice(0, maxFiles - currentCount);
    }

    if (newFiles.length === 0) return;

    this.selectedFiles.update((curr) => [...curr, ...newFiles]);

    // Generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedPreviews.update((curr) => [...curr, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  removeNewImage(index: number, event: Event) {
    event.stopPropagation();
    this.selectedFiles.update((curr) => {
      const copy = [...curr];
      copy.splice(index, 1);
      return copy;
    });
    this.selectedPreviews.update((curr) => {
      const copy = [...curr];
      copy.splice(index, 1);
      return copy;
    });
  }
  // ------------------------------------

  removeExistingImage(index: number, event: Event) {
    event.stopPropagation();
    this.existingImages.update((curr) => {
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
      species: animal.species,
      breed: animal.breed,
      age: animal.age,
      description: animal.description,
      status: animal.status,
      location: '',
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
    if (
      !this.form.name ||
      !this.form.species ||
      !this.form.breed ||
      !this.form.description ||
      !this.form.status ||
      this.form.age === null
    ) {
      this.toast.error('Validation', 'Please fill in all required fields (including age).');
      return;
    }

    this.saving.set(true);
    const fd = new FormData();
    fd.append('name', this.form.name);
    fd.append('species', this.form.species);
    fd.append('breed', this.form.breed);
    fd.append('age', String(this.form.age));
    fd.append('description', this.form.description);
    fd.append('status', this.form.status);
    fd.append('location', this.form.location || 'N/A');

    // Append existing images that are kept
    this.existingImages().forEach((img) => fd.append('existingImages', img));

    // Append each selected file under the 'images' key
    this.selectedFiles().forEach((f) => fd.append('images', f));

    const editId = this.editing();
    const obs$ = editId ? this.animalService.update(editId, fd) : this.animalService.create(fd);

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
        const msg =
          e.error?.message ||
          (e.error?.errors ? Object.values(e.error.errors).join(', ') : 'Could not save animal.');
        this.toast.error('Error', msg);
      },
    });
  }

  deleteAnimal(id: number) {
    if (!confirm('Delete this animal? This cannot be undone.')) return;
    this.deleting.set(id);
    this.animalService.delete(id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.toast.success('Animal deleted');
        this.load(this.page().number);
      },
      error: (e) => {
        this.deleting.set(null);
        this.toast.error('Error', e.error?.message);
      },
    });
  }

  private resetForm() {
    this.form = {
      name: '',
      species: '',
      breed: '',
      age: 0,
      description: '',
      status: 'AVAILABLE',
      location: '',
    };
    this.selectedFiles.set([]);
    this.selectedPreviews.set([]);
  }
}
