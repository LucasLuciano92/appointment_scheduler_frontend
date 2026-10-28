import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../config/api.config';
import { ApiClientService } from './api-client.service';

describe('ApiClientService reservations', () => {
  let api: ApiClientService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiClientService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates a reservation with the contract payload', () => {
    let status = '';
    api
      .createAppointment(9, '2030-01-08T10:00:00-03:00', 'Sin perfume')
      .subscribe(({ data }) => (status = data.status));

    const request = http.expectOne(`${API_URL}/appointments`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      appointment: {
        service_offering_id: 9,
        starts_at: '2030-01-08T10:00:00-03:00',
        notes: 'Sin perfume',
      },
    });
    request.flush({ data: { status: 'scheduled' } });
    expect(status).toBe('scheduled');
  });

  it('exposes a reservation validation error', () => {
    let code = '';
    api.createAppointment(9, '2030-01-08T10:00:00-03:00', '').subscribe({
      error: (error) => (code = error.error.error.code),
    });

    http.expectOne(`${API_URL}/appointments`).flush(
      {
        error: {
          code: 'validation_failed',
          message: 'No se pudo guardar el recurso.',
          details: { base: ['el horario ya no está disponible'] },
        },
      },
      { status: 422, statusText: 'Unprocessable Content' },
    );
    expect(code).toBe('validation_failed');
  });
});
