import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnimalReportResponse, Page } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = `${environment.apiUrl}/reports`;
  constructor(private http: HttpClient) {}

  getAll(params: { type?: string; speciesId?: number; location?: string; status?: string; page?: number; size?: number } = {}): Observable<Page<AnimalReportResponse>> {
    let p = new HttpParams();
    if (params.type)      p = p.set('type', params.type);
    if (params.speciesId) p = p.set('speciesId', params.speciesId);
    if (params.location)  p = p.set('location', params.location);
    if (params.status)    p = p.set('status', params.status);
    p = p.set('page', params.page ?? 0).set('size', params.size ?? 12);
    return this.http.get<Page<AnimalReportResponse>>(this.base, { params: p });
  }

  getById(id: number): Observable<AnimalReportResponse> {
    return this.http.get<AnimalReportResponse>(`${this.base}/${id}`);
  }

  getMyReports(page = 0, size = 10): Observable<Page<AnimalReportResponse>> {
    return this.http.get<Page<AnimalReportResponse>>(`${this.base}/my`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  create(form: FormData): Observable<AnimalReportResponse> {
    return this.http.post<AnimalReportResponse>(this.base, form);
  }

  update(id: number, form: FormData): Observable<AnimalReportResponse> {
    return this.http.put<AnimalReportResponse>(`${this.base}/${id}`, form);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  changeStatus(id: number, status: string): Observable<AnimalReportResponse> {
    return this.http.patch<AnimalReportResponse>(`${this.base}/${id}/status`, { status });
  }

  imageUrl(path: string | null): string {
    if (!path) return 'assets/images/report-placeholder.jpg';
    return `${environment.uploadsUrl}/${path}`;
  }
}
