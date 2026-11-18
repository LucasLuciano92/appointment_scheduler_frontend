import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_URL } from '../../core/config/api.config';
import { Appointment } from '../../core/models/api.models';
import { AppointmentList } from './appointment-list';

describe('AppointmentList', () => {
  let fixture: ComponentFixture<AppointmentList>;
  let http: HttpTestingController;

  const appointment: Appointment = {
    id: 17,
    starts_at: '2030-01-08T10:00:00-03:00',
    ends_at: '2030-01-08T10:30:00-03:00',
    status: 'scheduled',
    notes: 'Sin perfume',
    service: {
      id: 3,
      name: 'Masaje relajante',
      description: null,
      duration_minutes: 30,
      price: '25000.0',
      image_url: null,
    },
    staff_member: { id: 4, first_name: 'Ana', last_name: 'Pérez' },
    created_at: '2029-12-01T10:00:00-03:00',
    updated_at: '2029-12-01T10:00:00-03:00',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AppointmentList);
    http
      .expectOne(
        (request) =>
          request.url === `${API_URL}/appointments` && request.params.get('page') === '1',
      )
      .flush({ data: [appointment], meta: { page: 1, per_page: 25, next_page: null } });
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('cancels a future appointment after confirmation', () => {
    click('.cancel-action');
    click('.confirmation .danger');

    const request = http.expectOne(`${API_URL}/appointments/17/cancel`);
    expect(request.request.method).toBe('PATCH');
    request.flush({ data: { ...appointment, status: 'cancelled' } });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El turno fue cancelado correctamente.');
    expect(fixture.nativeElement.querySelector('.status')?.textContent).toContain('Cancelado');
    expect(fixture.nativeElement.querySelector('.cancel-action')).toBeNull();
  });

  it('shows a cancellation error returned by the API', () => {
    click('.cancel-action');
    click('.confirmation .danger');

    http.expectOne(`${API_URL}/appointments/17/cancel`).flush(
      {
        error: {
          code: 'not_cancellable',
          message: 'Solo se puede cancelar un turno propio, futuro y confirmado.',
        },
      },
      { status: 422, statusText: 'Unprocessable Content' },
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Solo se puede cancelar un turno propio, futuro y confirmado.',
    );
  });

  it('filters the history by appointment status', () => {
    const select = fixture.nativeElement.querySelector('#appointment-status') as HTMLSelectElement;
    select.value = 'cancelled';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const request = http.expectOne(
      (candidate) =>
        candidate.url === `${API_URL}/appointments` &&
        candidate.params.get('page') === '1' &&
        candidate.params.get('status') === 'cancelled',
    );
    request.flush({
      data: [{ ...appointment, status: 'cancelled' }],
      meta: { page: 1, per_page: 25, next_page: null },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.status')?.textContent).toContain('Cancelado');
  });

  function click(selector: string): void {
    const button = fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
  }
});
