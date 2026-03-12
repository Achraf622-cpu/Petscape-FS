import { inject, Injector, runInInjectionContext } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { throwError, BehaviorSubject, Observable, from } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';


let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

   if (req.url.includes('/auth/')) {
    return next(req);
  }

  return runInInjectionContext(injector, () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();
    const authReq = token ? addToken(req, token) : req;

    return next(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        console.log('[INTERCEPTOR] HTTP Error:', err.status, 'for URL:', req.url);
        if (err.status === 401) {
          return handle401(req, next, authService, router);
        }
        return throwError(() => err);
      })
    );
  });
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    return authService.refresh().pipe(
      switchMap(res => {
        isRefreshing = false;
        refreshSubject.next(res.token);
        return next(addToken(req, res.token));
      }),
      catchError(err => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  }


  return refreshSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => next(addToken(req, token!)))
  );
}
