import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SpeciesResponse } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class SpeciesService {
  private base = `${environment.apiUrl}/species`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<SpeciesResponse[]> {
    return this.http.get<SpeciesResponse[]>(this.base);
  }
  getById(id: number): Observable<SpeciesResponse> {
    return this.http.get<SpeciesResponse>(`${this.base}/${id}`);
  }
  create(body: { name: string; description?: string }): Observable<SpeciesResponse> {
    return this.http.post<SpeciesResponse>(this.base, body);
  }
  update(id: number, body: { name: string; description?: string }): Observable<SpeciesResponse> {
    return this.http.put<SpeciesResponse>(`${this.base}/${id}`, body);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
