import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppointmentResponse, Page } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private base = `${environment.apiUrl}/appointments`;
  constructor(private http: HttpClient) {}

  book(body: { animalId: number; date: string; timeSlot: string; notes?: string }): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(this.base, body);
  }

  getMyAppointments(page = 0, size = 10): Observable<Page<AppointmentResponse>> {
    return this.http.get<Page<AppointmentResponse>>(`${this.base}/my`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/cancel`);
  }

  updateStatus(id: number, status: string): Observable<AppointmentResponse> {
    return this.http.patch<AppointmentResponse>(`${this.base}/${id}/status`, { status });
  }
}
