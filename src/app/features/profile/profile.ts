import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { apiErrorMessage, apiFieldErrors } from '../../core/api/api-error';
import { AuthService, ProfileUpdateData } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly fieldErrors = signal<Record<string, string[]>>({});
  protected readonly form = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email_address: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', Validators.minLength(8)],
    password_confirmation: [''],
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth
      .profile()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.form.patchValue({ ...data, phone: data.phone ?? '' });
        },
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
  }

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.password !== value.password_confirmation) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    const data: ProfileUpdateData = {
      first_name: value.first_name,
      last_name: value.last_name,
      email_address: value.email_address,
      phone: value.phone,
    };
    if (value.password) {
      data.password = value.password;
      data.password_confirmation = value.password_confirmation;
    }

    this.submitting.set(true);
    this.error.set('');
    this.success.set('');
    this.fieldErrors.set({});
    this.auth
      .updateProfile(data)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          if (value.password) {
            this.auth.clear();
            void this.router.navigate(['/ingresar'], { queryParams: { passwordUpdated: 'true' } });
            return;
          }
          this.form.patchValue({ password: '', password_confirmation: '' });
          this.form.markAsPristine();
          this.success.set('Tus datos fueron actualizados.');
        },
        error: (error) => {
          this.error.set(apiErrorMessage(error));
          this.fieldErrors.set(apiFieldErrors(error));
        },
      });
  }

  protected fieldError(field: string): string {
    return this.fieldErrors()[field]?.join('. ') ?? '';
  }
}
