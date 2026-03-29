import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdoptionRequestResponse, Page } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AdoptionRequestService {
  private base = `${environment.apiUrl}/adoption-requests`;
  constructor(private http: HttpClient) {}

  store(animalId: number, message: string): Observable<AdoptionRequestResponse> {
    return this.http.post<AdoptionRequestResponse>(this.base, { animalId, message });
  }

  getMyRequests(page = 0, size = 10): Observable<Page<AdoptionRequestResponse>> {
    return this.http.get<Page<AdoptionRequestResponse>>(`${this.base}/my`, {
      params: new HttpParams().set('page', page).set('size', size),
    });
  }

  getById(id: number): Observable<AdoptionRequestResponse> {
    return this.http.get<AdoptionRequestResponse>(`${this.base}/${id}`);
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/cancel`);
  }

  updateStatus(id: number, status: string): Observable<AdoptionRequestResponse> {
    return this.http.patch<AdoptionRequestResponse>(`${this.base}/${id}/status`, { status });
  }

  getPending(): Observable<AdoptionRequestResponse[]> {
    return this.http.get<AdoptionRequestResponse[]>(`${this.base}/pending`);
  }
}
