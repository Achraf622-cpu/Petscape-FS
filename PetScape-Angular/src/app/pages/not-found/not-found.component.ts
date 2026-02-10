import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="nf-page page-enter">
      <div class="nf-content">
        <div class="nf-number">404</div>
        <div class="nf-paw"><i class="bi bi-question-circle-fill"></i></div>
        <h1>Page Not Found</h1>
        <p>Oops! It seems this page wandered off. Let's help it find its way home.</p>
        <div class="nf-actions">
          <a routerLink="/" class="btn-primary"><i class="bi bi-house-fill"></i> Back to Home</a>
          <a routerLink="/animals" class="btn-outline"><i class="bi bi-heart-fill"></i> Browse Pets</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nf-page { min-height:80vh; display:flex; align-items:center; justify-content:center; text-align:center; padding:2rem; }
    .nf-content { max-width:480px; }
    .nf-number { font-size:8rem; font-weight:900; line-height:1; background:linear-gradient(135deg,#14b8a6,#7c3aed); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .nf-paw { font-size:3rem; color:#374151; margin-bottom:1rem; }
    h1 { font-size:2rem; font-weight:800; color:#f9fafb; margin-bottom:0.75rem; }
    p { color:#6b7280; line-height:1.7; margin-bottom:2rem; }
    .nf-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
  `]
})
export class NotFoundComponent {}
