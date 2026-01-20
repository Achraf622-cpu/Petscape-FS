import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <!-- Brand -->
          <div class="footer-brand">
            <div class="brand-logo">
              <div class="brand-icon"><i class="bi bi-heart-fill"></i></div>
              <span>PetsCape</span>
            </div>
            <p>Connecting loving families with pets in need. Every adoption changes two lives.</p>
            <div class="social-links">
              <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
              <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
              <a href="#" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-col">
            <h4>Adopt</h4>
            <ul>
              <li><a routerLink="/animals">Browse Pets</a></li>
              <li><a routerLink="/animals">Dogs</a></li>
              <li><a routerLink="/animals">Cats</a></li>
              <li><a routerLink="/dashboard/adoptions">My Requests</a></li>
            </ul>
          </div>

          <!-- Reports -->
          <div class="footer-col">
            <h4>Community</h4>
            <ul>
              <li><a routerLink="/reports">Lost Animals</a></li>
              <li><a routerLink="/reports">Found Animals</a></li>
              <li><a routerLink="/dashboard/reports">My Reports</a></li>
              <li><a routerLink="/dashboard/donate">Donate</a></li>
            </ul>
          </div>

          <!-- Account -->
          <div class="footer-col">
            <h4>Account</h4>
            <ul>
              <li><a routerLink="/auth/login">Sign In</a></li>
              <li><a routerLink="/auth/register">Register</a></li>
              <li><a routerLink="/dashboard/profile">Profile</a></li>
              <li><a routerLink="/dashboard/notifications">Notifications</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2026 PetsCape. Built with <i class="bi bi-heart-fill" style="color:#ef4444"></i> for animals everywhere.</p>
          <p class="tech-stack">Angular 17 · Spring Boot 3 · PostgreSQL</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #0d1117;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding: 3rem 1.5rem 1.5rem;
      margin-top: auto;
    }
    .footer-inner { max-width: 1280px; margin: 0 auto; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem; }
    .footer-brand .brand-logo { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem; }
    .brand-icon { width:32px; height:32px; background:linear-gradient(135deg,#0f766e,#14b8a6); border-radius:8px; display:flex; align-items:center; justify-content:center; color:white; font-size:0.875rem; }
    .footer-brand .brand-logo span { font-size:1.2rem; font-weight:800; background:linear-gradient(135deg,#14b8a6,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .footer-brand p { color:#6b7280; font-size:0.875rem; line-height:1.6; margin-bottom:1rem; max-width:280px; }
    .social-links { display:flex; gap:0.75rem; }
    .social-links a { color:#6b7280; font-size:1.1rem; transition:color 0.2s; }
    .social-links a:hover { color:#14b8a6; }
    .footer-col h4 { color:#f9fafb; font-weight:600; font-size:0.9rem; margin-bottom:0.75rem; }
    .footer-col ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.4rem; }
    .footer-col a { color:#6b7280; text-decoration:none; font-size:0.875rem; transition:color 0.2s; }
    .footer-col a:hover { color:#14b8a6; }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); padding-top:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; }
    .footer-bottom p { color:#4b5563; font-size:0.8rem; margin:0; }
    .tech-stack { color:#374151 !important; }
    @media (max-width: 768px) {
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .footer-bottom { flex-direction:column; text-align:center; }
    }
    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class FooterComponent {}
