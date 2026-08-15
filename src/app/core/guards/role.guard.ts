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

    if (!isAuthenticated) {
      router.navigate(['/login']);
      return false;
    }

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

  if (!store.selectSnapshot(AuthState.isAuthenticated)) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
