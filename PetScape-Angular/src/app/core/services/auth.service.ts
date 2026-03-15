import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'petscape_token';
  private readonly REFRESH_KEY = 'petscape_refresh';
  private readonly USER_KEY = 'petscape_user';

  private _token = signal<string | null>(null);
  private _user = signal<Partial<AuthResponse> | null>(this.loadUser());

  readonly isAuthenticated = computed(() => !!this._token() || !!this._user());
  readonly currentUser = computed(() => this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

  /**
   * A promise that resolves once the initial token refresh attempt
   * completes (success OR failure). Guards await this before deciding.
   */
  readonly ready: Promise<void>;

  constructor(private http: HttpClient, private router: Router) {
    this.ready = this.tryInitialRefresh();
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap(res => this.saveSession(res))
    );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    if (!refreshToken) return throwError(() => new Error('No refresh token'));
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout(): void {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe({
        error: () => {} // silent fail — always clear locally
      });
    }
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null { return this._token(); }

  private saveSession(res: AuthResponse): void {
    this._token.set(res.token);
    localStorage.setItem(this.REFRESH_KEY, res.refreshToken);
    const user: Partial<AuthResponse> = {
      id: res.id, email: res.email, firstname: res.firstname,
      lastname: res.lastname, role: res.role
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private clearSession(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * On page load: if localStorage has both user data and a refresh token,
   * exchange the refresh token for a fresh JWT. Returns a promise so
   * guards can `await` before making routing decisions.
   */
  private async tryInitialRefresh(): Promise<void> {
    const hasUser = !!localStorage.getItem(this.USER_KEY);
    const hasRefresh = !!localStorage.getItem(this.REFRESH_KEY);

    if (!hasUser || !hasRefresh) {
      // No saved session — nothing to restore
      if (hasUser || hasRefresh) this.clearSession();
      return;
    }

    try {
      await firstValueFrom(this.refresh());
      // Session fully restored — _token, _user, localStorage all set
    } catch {
      // Refresh token expired or revoked — clean slate
      this.clearSession();
    }
  }

  private loadUser(): Partial<AuthResponse> | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (raw && !localStorage.getItem(this.REFRESH_KEY)) {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
    return raw ? JSON.parse(raw) : null;
  }
}
