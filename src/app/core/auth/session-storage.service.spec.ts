import { TestBed } from '@angular/core/testing';
import { SessionStorageService } from './session-storage.service';

describe('SessionStorageService', () => {
  let service: SessionStorageService;

  beforeEach(() => {
    sessionStorage.clear();
    service = TestBed.inject(SessionStorageService);
  });

  it('stores, reads and clears an authenticated session', () => {
    const session = {
      token: 'test-token',
      user: {
        id: 1,
        email: 'user@example.com',
        first_name: 'Ada',
        last_name: 'Lovelace',
        role: 'customer' as const,
      },
    };

    service.write(session);
    expect(service.read()).toEqual(session);
    service.clear();
    expect(service.read()).toBeNull();
  });

  it('removes malformed stored data', () => {
    sessionStorage.setItem('appointment_scheduler.session', '{invalid');
    expect(service.read()).toBeNull();
  });
});
