import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ApiClientService } from '../api/api-client.service';
import { SessionStorageService } from './session-storage.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let api: ApiClientService;
  let http: HttpTestingController;
  let storage: SessionStorageService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    api = TestBed.inject(ApiClientService);
    http = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(SessionStorageService);
  });

  afterEach(() => http.verify());

  it('adds the bearer token to API requests', () => {
    storage.write({
      token: 'opaque-token',
      user: {
        id: 1,
        first_name: 'Ana',
        last_name: 'Pérez',
        email_address: 'ana@example.com',
        phone: null,
      },
    });

    api.services().subscribe();
    const request = http.expectOne((candidate) => candidate.url.endsWith('/services'));
    expect(request.request.headers.get('Authorization')).toBe('Bearer opaque-token');
    request.flush({ data: [] });
  });

  it('clears an expired session and redirects on 401', async () => {
    const router = TestBed.inject(Router);
    storage.write({
      token: 'expired',
      user: {
        id: 1,
        first_name: 'Ana',
        last_name: 'Pérez',
        email_address: 'ana@example.com',
        phone: null,
      },
    });
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    api.services().subscribe({ error: () => undefined });
    http
      .expectOne((candidate) => candidate.url.endsWith('/services'))
      .flush(
        { error: { code: 'unauthorized', message: 'Sesión inválida.' } },
        { status: 401, statusText: 'Unauthorized' },
      );
    await Promise.resolve();

    expect(storage.read()).toBeNull();
    expect(navigate).toHaveBeenCalled();
  });
});
