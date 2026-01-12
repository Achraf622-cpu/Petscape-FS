import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}/notifications`;
  readonly unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.base);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/count`).pipe(
      tap(res => this.unreadCount.set(res.count))
    );
  }

  markRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/read`, {}).pipe(
      tap(() => this.unreadCount.update(n => Math.max(0, n - 1)))
    );
  }

  markAllRead(): Observable<void> {
    return this.http.patch<void>(`${this.base}/read-all`, {}).pipe(
      tap(() => this.unreadCount.set(0))
    );
  }
}
