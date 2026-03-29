import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnimalResponse, AnimalRequest, Page } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private base = `${environment.apiUrl}/animals`;
  constructor(private http: HttpClient) {}

  getAll(
    params: {
      species?: string;
      status?: string;
      search?: string;
      page?: number;
      size?: number;
    } = {},
  ): Observable<Page<AnimalResponse>> {
    let p = new HttpParams();
    if (params.species) p = p.set('species', params.species);
    if (params.status) p = p.set('status', params.status);
    if (params.search) p = p.set('search', params.search);
    p = p.set('page', params.page ?? 0).set('size', params.size ?? 12);
    return this.http.get<Page<AnimalResponse>>(this.base, { params: p });
  }

  getForAdoption(
    params: {
      species?: string;
      maxAge?: number;
      search?: string;
      page?: number;
      size?: number;
    } = {},
  ): Observable<{ animals: Page<AnimalResponse>; adoptedCount: number }> {
    let p = new HttpParams();
    if (params.species) p = p.set('species', params.species);
    if (params.maxAge) p = p.set('maxAge', params.maxAge);
    if (params.search) p = p.set('search', params.search);
    p = p.set('page', params.page ?? 0).set('size', params.size ?? 12);
    return this.http.get<{ animals: Page<AnimalResponse>; adoptedCount: number }>(
      `${this.base}/adoption`,
      { params: p },
    );
  }

  getById(id: number): Observable<AnimalResponse> {
    return this.http.get<AnimalResponse>(`${this.base}/${id}`);
  }

  create(form: FormData): Observable<AnimalResponse> {
    return this.http.post<AnimalResponse>(this.base, form);
  }

  update(id: number, form: FormData): Observable<AnimalResponse> {
    return this.http.put<AnimalResponse>(`${this.base}/${id}`, form);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  imageUrl(path: string | null): string {
    if (!path) return 'assets/images/pet-placeholder.jpg';
    return `${environment.uploadsUrl}/${path}`;
  }
}
