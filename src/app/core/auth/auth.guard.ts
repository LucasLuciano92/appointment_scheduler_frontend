import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStorageService } from './session-storage.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const storage = inject(SessionStorageService);
  const router = inject(Router);
  return storage.read()
    ? true
    : router.createUrlTree(['/ingresar'], { queryParams: { returnUrl: state.url } });
};
