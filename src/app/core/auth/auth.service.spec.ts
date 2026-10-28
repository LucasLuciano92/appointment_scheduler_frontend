import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../config/api.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('stores the session after a successful login', () => {
    service.login({ email_address: 'cliente@example.com', password: 'password123' }).subscribe();

    const request = http.expectOne(`${API_URL}/session`);
    expect(request.request.body).toEqual({
      session: { email_address: 'cliente@example.com', password: 'password123' },
    });
    request.flush({
      data: {
        id: 1,
        first_name: 'Ana',
        last_name: 'Pérez',
        email_address: 'cliente@example.com',
        phone: null,
      },
      token: 'opaque-token',
    });

    expect(service.session()?.token).toBe('opaque-token');
  });

  it('does not create a session when login fails', () => {
    let status = 0;
    service
      .login({ email_address: 'cliente@example.com', password: 'incorrecta' })
      .subscribe({ error: (error) => (status = error.status) });

    http
      .expectOne(`${API_URL}/session`)
      .flush(
        { error: { code: 'invalid_credentials', message: 'Email o contraseña inválidos.' } },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(status).toBe(401);
    expect(service.session()).toBeNull();
  });
});
