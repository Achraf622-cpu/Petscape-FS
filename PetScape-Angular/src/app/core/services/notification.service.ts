import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}/notifications`;
  readonly unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  getAll(): Observable<Notification[]> {
    return this.http.get<{ content: Notification[] }>(this.base).pipe(
      map(res => res.content)
    );
  }

  getUnreadCount(): Observable<{ unread: number }> {
    return this.http.get<{ unread: number }>(`${this.base}/count`).pipe(
      tap(res => this.unreadCount.set(res.unread))
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
