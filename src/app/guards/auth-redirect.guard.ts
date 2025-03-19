import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const redirectIfAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const userRole = authService.getStoredRole();
    router.navigate([userRole === 'admin' ? '/dashboard' : '/user-dashboard']);
    return false;
  }

  return true;
};
