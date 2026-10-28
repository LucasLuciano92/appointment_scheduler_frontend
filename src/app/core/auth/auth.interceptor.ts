import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../config/api.config';
import { SessionStorageService } from './session-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const storage = inject(SessionStorageService);
  const router = inject(Router);
  const session = storage.read();
  const apiRequest = request.url === API_URL || request.url.startsWith(`${API_URL}/`);
  const authenticatedRequest =
    apiRequest && session
      ? request.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (apiRequest && error.status === 401) {
        storage.clear();
        const returnUrl = router.url.startsWith('/') ? router.url : '/servicios';
        void router.navigate(['/ingresar'], { queryParams: { returnUrl } });
      }
      return throwError(() => error);
    }),
  );
};
