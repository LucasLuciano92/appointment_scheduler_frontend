import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { API_URL } from '../../core/config/api.config';
import { User } from '../../core/models/api.models';
import { Profile } from './profile';

describe('Profile', () => {
  let fixture: ComponentFixture<Profile>;
  let http: HttpTestingController;
  let router: Router;

  const user: User = {
    id: 1,
    first_name: 'Ana',
    last_name: 'Pérez',
    email_address: 'ana@example.com',
    phone: null,
  };

  beforeEach(async () => {
    sessionStorage.clear();
    sessionStorage.setItem(
      'appointment_scheduler.session',
      JSON.stringify({ token: 'opaque-token', user }),
    );
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Profile);
    http.expectOne(`${API_URL}/profile`).flush({ data: user });
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('updates personal data and confirms the operation', () => {
    setInput('first_name', 'Anita');
    submit();

    const request = http.expectOne(`${API_URL}/profile`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      user: {
        first_name: 'Anita',
        last_name: 'Pérez',
        email_address: 'ana@example.com',
        phone: '',
      },
    });
    request.flush({ data: { ...user, first_name: 'Anita' } });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tus datos fueron actualizados.');
  });

  it('clears the revoked session after changing the password', async () => {
    const navigate = vi.spyOn(router, 'navigate');
    setInput('password', 'nueva-clave-123');
    setInput('password_confirmation', 'nueva-clave-123');
    submit();

    http.expectOne(`${API_URL}/profile`).flush({ data: user });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sessionStorage.getItem('appointment_scheduler.session')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/ingresar'], {
      queryParams: { passwordUpdated: 'true' },
    });
  });

  function setInput(name: string, value: string): void {
    const input = fixture.nativeElement.querySelector(
      `[formcontrolname="${name}"]`,
    ) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function submit(): void {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }
});
