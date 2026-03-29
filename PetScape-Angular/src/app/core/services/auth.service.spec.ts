import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../../models/models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login request and save session', () => {
    const mockResponse: AuthResponse = {
      token: 'fake-jwt',
      refreshToken: 'fake-refresh',
      id: 1,
      email: 'test@test.com',
      firstname: 'Test',
      lastname: 'User',
      role: 'USER',
    };

    service.login({ email: 'test@test.com', password: 'password' }).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(service.getToken()).toBe('fake-jwt');
      expect(localStorage.getItem('petscape_refresh')).toBe('fake-refresh');
      expect(service.isAuthenticated()).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear session on logout', () => {
    localStorage.setItem('petscape_refresh', 'fake-refresh');
    service.logout();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush(null);

    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('petscape_refresh')).toBeNull();
  });
});
