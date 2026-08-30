import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState } from '../../store/auth/auth.state';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  // Coba baca token dari NGXS store dulu
  let token = store.selectSnapshot(AuthState.token);

  // Fallback: baca langsung dari localStorage jika store belum hydrated
  if (!token) {
    try {
      const raw = localStorage.getItem('auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        token = parsed?.token ?? null;
      }
    } catch {
      token = null;
    }
  }

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
