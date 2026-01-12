import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnimalResponse, AdoptionRequestResponse, AppointmentResponse, UserResponse, Page } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;
  constructor(private http: HttpClient) {}

  getDashboard(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(`${this.base}/dashboard`);
  }

  getAnimals(page = 0, size = 15): Observable<Page<AnimalResponse>> {
    return this.http.get<Page<AnimalResponse>>(`${this.base}/animals`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getAdoptions(page = 0, size = 15): Observable<Page<AdoptionRequestResponse>> {
    return this.http.get<Page<AdoptionRequestResponse>>(`${this.base}/adoptions`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getAppointments(page = 0, size = 15): Observable<Page<AppointmentResponse>> {
    return this.http.get<Page<AppointmentResponse>>(`${this.base}/appointments`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getUsers(page = 0, size = 15): Observable<Page<UserResponse>> {
    return this.http.get<Page<UserResponse>>(`${this.base}/users`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getDonations(page = 0, size = 15): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(`${this.base}/donations`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  // ── User Management ──
  changeRole(userId: number, role: 'USER' | 'ADMIN'): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/users/${userId}/role?role=${role}`, {});
  }

  banUser(userId: number, request: { reason: string, comment?: string, durationDays?: number }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/users/${userId}/ban`, request);
  }

  unbanUser(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/users/${userId}/ban`);
  }

  getAuditLogs(params: { userId?: number; action?: string; entityType?: string; page?: number; size?: number } = {}): Observable<Page<any>> {
    let p = new HttpParams();
    if (params.userId)     p = p.set('userId', params.userId);
    if (params.action)     p = p.set('action', params.action);
    if (params.entityType) p = p.set('entityType', params.entityType);
    p = p.set('page', params.page ?? 0).set('size', params.size ?? 20);
    return this.http.get<Page<any>>(`${this.base}/audit-logs`, { params: p });
  }
}
