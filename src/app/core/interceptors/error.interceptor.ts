import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { catchError, throwError } from 'rxjs';
import { Logout } from '../../store/auth/auth.actions';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized (token expired atau invalid)
      if (error.status === 401) {
        // Clear auth state dan redirect ke login
        store.dispatch(new Logout());
        
        // Pastikan redirect ke login jika belum di halaman login
        if (!router.url.includes('/login')) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url },
          });
        }
      }

      // Pass error ke caller untuk handling spesifik jika diperlukan
      return throwError(() => error);
    })
  );
};
