import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(title: string, message?: string) { this.add('success', title, message); }
  error(title: string, message?: string)   { this.add('error',   title, message); }
  info(title: string, message?: string)    { this.add('info',    title, message); }
  warning(title: string, message?: string) { this.add('warning', title, message); }

  remove(id: number) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }

  private add(type: Toast['type'], title: string, message?: string) {
    const id = ++this.counter;
    this.toasts.update(t => [...t, { id, type, title, message }]);
    setTimeout(() => this.remove(id), 4500);
  }
}
