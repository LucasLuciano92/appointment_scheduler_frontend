import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { API_URL } from '../../core/config/api.config';
import { Appointment, Service, StaffMember } from '../../core/models/api.models';
import { Booking } from './booking';

describe('Booking', () => {
  let fixture: ComponentFixture<Booking>;
  let http: HttpTestingController;

  const service: Service = {
    id: 3,
    name: 'Masaje relajante',
    description: 'Sesión de relajación',
    duration_minutes: 30,
    price: '25000.0',
    image_url: null,
  };
  const staff: StaffMember = {
    id: 4,
    first_name: 'Ana',
    last_name: 'Pérez',
    service_offering_id: 9,
  };
  const slot = {
    starts_at: '2030-01-08T10:00:00-03:00',
    ends_at: '2030-01-08T10:30:00-03:00',
  };
  const appointment: Appointment = {
    id: 17,
    ...slot,
    status: 'scheduled',
    notes: 'Sin perfume',
    service,
    staff_member: { id: staff.id, first_name: staff.first_name, last_name: staff.last_name },
    created_at: '2029-12-01T10:00:00-03:00',
    updated_at: '2029-12-01T10:00:00-03:00',
  };

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Booking],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ serviceId: '3' }) } },
        },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('restores the booking selection after returning from login', async () => {
    sessionStorage.setItem(
      'appointment_scheduler.booking_draft',
      JSON.stringify({
        serviceId: 3,
        serviceOfferingId: 9,
        date: '2030-01-08',
        slotStartsAt: slot.starts_at,
        notes: 'Sin perfume',
      }),
    );

    createAndLoad();
    http
      .expectOne(
        (request) =>
          request.url === `${API_URL}/service_offerings/9/available_slots` &&
          request.params.get('date') === '2030-01-08',
      )
      .flush({ data: [slot] });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      (fixture.nativeElement.querySelector('input[type="date"]') as HTMLInputElement).value,
    ).toBe('2030-01-08');
    expect((fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement).value).toBe(
      'Sin perfume',
    );
    expect(fixture.nativeElement.querySelectorAll('button.selected')).toHaveLength(2);
  });

  it('shows the appointment persisted by Rails after booking', () => {
    sessionStorage.setItem(
      'appointment_scheduler.session',
      JSON.stringify({
        token: 'opaque-token',
        user: {
          id: 1,
          first_name: 'Eva',
          last_name: 'Cliente',
          email_address: 'eva@example.com',
          phone: null,
        },
      }),
    );
    createAndLoad();

    click('.options button');
    const dateInput = fixture.nativeElement.querySelector('input[type="date"]') as HTMLInputElement;
    dateInput.value = '2030-01-08';
    dateInput.dispatchEvent(new Event('input'));
    dateInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    http
      .expectOne(
        (request) =>
          request.url === `${API_URL}/service_offerings/9/available_slots` &&
          request.params.get('date') === '2030-01-08',
      )
      .flush({ data: [slot] });
    fixture.detectChanges();

    click('.slots button');
    const notes = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    notes.value = 'Sin perfume';
    notes.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    click('button.primary');

    const request = http.expectOne(`${API_URL}/appointments`);
    expect(request.request.method).toBe('POST');
    request.flush({ data: appointment });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tu turno quedó confirmado.');
    const detailLink = fixture.nativeElement.querySelector(
      '.confirmed-appointment a',
    ) as HTMLAnchorElement;
    expect(detailLink.getAttribute('href')).toBe('/turnos/17');
  });

  function createAndLoad(): void {
    fixture = TestBed.createComponent(Booking);
    const serviceRequest = http.expectOne(`${API_URL}/services/3`);
    const staffRequest = http.expectOne(`${API_URL}/services/3/staff_members`);
    serviceRequest.flush({ data: service });
    staffRequest.flush({ data: [staff] });
    fixture.detectChanges();
  }

  function click(selector: string): void {
    const button = fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
  }
});
