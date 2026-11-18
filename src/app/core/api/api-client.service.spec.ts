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

  it('lists the requested appointments page', () => {
    let nextPage: number | null = null;
    api.appointments(2).subscribe(({ meta }) => (nextPage = meta.next_page));

    const request = http.expectOne(
      (candidate) =>
        candidate.url === `${API_URL}/appointments` && candidate.params.get('page') === '2',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ data: [], meta: { page: 2, per_page: 25, next_page: 3 } });

    expect(nextPage).toBe(3);
  });

  it('filters appointments by status when requested', () => {
    api.appointments(1, 'cancelled').subscribe();

    const request = http.expectOne(
      (candidate) =>
        candidate.url === `${API_URL}/appointments` &&
        candidate.params.get('page') === '1' &&
        candidate.params.get('status') === 'cancelled',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ data: [], meta: { page: 1, per_page: 25, next_page: null } });
  });

  it('loads an appointment detail', () => {
    let appointmentId = 0;
    api.appointment(17).subscribe(({ data }) => (appointmentId = data.id));

    const request = http.expectOne(`${API_URL}/appointments/17`);
    expect(request.request.method).toBe('GET');
    request.flush({ data: { id: 17 } });
    expect(appointmentId).toBe(17);
  });

  it('cancels an appointment through its action endpoint', () => {
    let status = '';
    api.cancelAppointment(17).subscribe(({ data }) => (status = data.status));

    const request = http.expectOne(`${API_URL}/appointments/17/cancel`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});
    request.flush({ data: { status: 'cancelled' } });

    expect(status).toBe('cancelled');
  });
});
