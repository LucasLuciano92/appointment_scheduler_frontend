import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { SessionStorageService } from './session-storage.service';

describe('authentication guards', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => sessionStorage.clear());

  it('sends unauthenticated users to login with the requested URL', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/turnos/17' } as RouterStateSnapshot),
    );

    expect(result.toString()).toBe('/ingresar?returnUrl=%2Fturnos%2F17');
  });

  it('keeps authenticated users out of login and registration routes', () => {
    TestBed.inject(SessionStorageService).write({
      token: 'opaque-token',
      user: {
        id: 1,
        first_name: 'Ana',
        last_name: 'Pérez',
        email_address: 'ana@example.com',
        phone: null,
      },
    });

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result.toString()).toBe('/servicios');
    expect(TestBed.inject(Router)).toBeTruthy();
  });
});
