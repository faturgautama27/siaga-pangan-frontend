import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../../store/auth/auth.state';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const store = inject(Store);
    const router = inject(Router);

    const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
    const role = store.selectSnapshot(AuthState.role);
    const token = store.selectSnapshot(AuthState.token);

    // Cek apakah authenticated dan token masih valid
    if (!isAuthenticated || !token) {
      router.navigate(['/login']);
      return false;
    }

    // Optional: Cek token expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        store.dispatch({ type: '[Auth] Logout' });
        router.navigate(['/login']);
        return false;
      }
    } catch {
      router.navigate(['/login']);
      return false;
    }

    // Cek role access
    if (!role || !allowedRoles.includes(role)) {
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
};

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
  const token = store.selectSnapshot(AuthState.token);

  // Jika tidak ada token atau tidak authenticated
  if (!isAuthenticated || !token) {
    router.navigate(['/login']);
    return false;
  }

  // Optional: Cek apakah token expired (decode JWT dan cek exp)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Jika token sudah expired
    if (payload.exp && payload.exp < now) {
      // Clear state dan redirect ke login
      store.dispatch({ type: '[Auth] Logout' });
      router.navigate(['/login']);
      return false;
    }
  } catch {
    // Jika error parsing token, anggap invalid
    router.navigate(['/login']);
    return false;
  }

  return true;
};
