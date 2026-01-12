import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.base}/profile`);
  }

  updateProfile(body: { firstname: string; lastname: string }): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.base}/profile`, body);
  }

  changePassword(body: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.patch<void>(`${this.base}/password`, body);
  }

  deleteAccount(password: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/account`, { body: { password } });
  }
}
