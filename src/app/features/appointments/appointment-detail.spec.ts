import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { API_URL } from '../../core/config/api.config';
import { Appointment } from '../../core/models/api.models';
import { AppointmentDetail } from './appointment-detail';

describe('AppointmentDetail', () => {
  let fixture: ComponentFixture<AppointmentDetail>;
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
      imports: [AppointmentDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '17' }) } },
        },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AppointmentDetail);
    http.expectOne(`${API_URL}/appointments/17`).flush({ data: appointment });
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('shows the appointment returned by Rails', () => {
    expect(fixture.nativeElement.textContent).toContain('Masaje relajante');
    expect(fixture.nativeElement.textContent).toContain('Ana Pérez');
    expect(fixture.nativeElement.textContent).toContain('Sin perfume');
  });

  it('cancels a future appointment after confirmation', () => {
    click('.cancel-action');
    click('.confirmation .danger');

    const request = http.expectOne(`${API_URL}/appointments/17/cancel`);
    expect(request.request.method).toBe('PATCH');
    request.flush({ data: { ...appointment, status: 'cancelled' } });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El turno fue cancelado correctamente.');
    expect(fixture.nativeElement.querySelector('.status')?.textContent).toContain('Cancelado');
  });

  function click(selector: string): void {
    const button = fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
  }
});
