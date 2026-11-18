import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { apiErrorMessage, apiFieldErrors } from '../../../core/api/api-error';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: '../auth-form.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly fieldErrors = signal<Record<string, string[]>>({});
  protected readonly form = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email_address: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });
  protected readonly returnUrl = this.safeReturnUrl();

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
    this.submitting.set(true);
    this.error.set('');
    this.fieldErrors.set({});
    this.auth
      .register(value)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl(this.returnUrl),
        error: (error) => {
          this.error.set(apiErrorMessage(error));
          this.fieldErrors.set(apiFieldErrors(error));
        },
      });
  }

  protected fieldError(field: string): string {
    return this.fieldErrors()[field]?.join('. ') ?? '';
  }

  private safeReturnUrl(): string {
    const value = this.route.snapshot.queryParamMap.get('returnUrl');
    return value?.startsWith('/') && !value.startsWith('//') ? value : '/servicios';
  }
}
