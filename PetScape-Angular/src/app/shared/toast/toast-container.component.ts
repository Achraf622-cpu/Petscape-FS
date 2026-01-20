import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type" (click)="toastService.remove(toast.id)">
          <div class="toast-icon">
            <i [class]="iconMap[toast.type]"></i>
          </div>
          <div class="toast-body">
            <div class="toast-title">{{ toast.title }}</div>
            @if (toast.message) {
              <div class="toast-msg">{{ toast.message }}</div>
            }
          </div>
          <button class="toast-close" (click)="toastService.remove(toast.id)">
            <i class="bi bi-x"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      max-width: 360px;
      width: 100%;
      pointer-events: none;
    }
    .toast-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.9rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid transparent;
      backdrop-filter: blur(12px);
      animation: slideInRight 0.3s ease;
      pointer-events: all;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .toast-success { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.3); }
    .toast-error   { background: rgba(239,68,68,0.15);  border-color: rgba(239,68,68,0.3); }
    .toast-info    { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.3); }
    .toast-warning { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.3); }
    .toast-icon { font-size: 1.1rem; margin-top: 1px; flex-shrink: 0; }
    .toast-success .toast-icon { color: #34d399; }
    .toast-error   .toast-icon { color: #f87171; }
    .toast-info    .toast-icon { color: #60a5fa; }
    .toast-warning .toast-icon { color: #fbbf24; }
    .toast-body { flex: 1; min-width: 0; }
    .toast-title { color: #f9fafb; font-size: 0.875rem; font-weight: 600; }
    .toast-msg { color: #9ca3af; font-size: 0.8rem; margin-top: 2px; }
    .toast-close { background:none; border:none; color:#6b7280; cursor:pointer; padding:0 0.25rem; font-size:1rem; line-height:1; transition:color 0.15s; }
    .toast-close:hover { color: #f9fafb; }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
  readonly iconMap: Record<string, string> = {
    success: 'bi bi-check-circle-fill',
    error:   'bi bi-x-circle-fill',
    info:    'bi bi-info-circle-fill',
    warning: 'bi bi-exclamation-triangle-fill',
  };
}
