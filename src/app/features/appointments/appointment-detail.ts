import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { apiErrorMessage } from '../../core/api/api-error';
import { Appointment, AppointmentStatus } from '../../core/models/api.models';

@Component({
  selector: 'app-appointment-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './appointment-detail.html',
  styleUrl: './appointment-detail.scss',
})
export class AppointmentDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiClientService);
  private readonly appointmentId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly appointment = signal<Appointment | null>(null);
  protected readonly loading = signal(true);
  protected readonly cancelling = signal(false);
  protected readonly confirmingCancellation = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');

  constructor() {
    if (!Number.isInteger(this.appointmentId) || this.appointmentId < 1) {
      void this.router.navigate(['/turnos']);
      return;
    }
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api
      .appointment(this.appointmentId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ data }) => this.appointment.set(data),
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
  }

  protected canCancel(): boolean {
    const appointment = this.appointment();
    return Boolean(
      appointment &&
      appointment.status === 'scheduled' &&
      new Date(appointment.starts_at).getTime() > Date.now(),
    );
  }

  protected cancel(): void {
    const appointment = this.appointment();
    if (!appointment || !this.canCancel() || this.cancelling()) return;

    this.cancelling.set(true);
    this.error.set('');
    this.success.set('');
    this.api
      .cancelAppointment(appointment.id)
      .pipe(finalize(() => this.cancelling.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.appointment.set(data);
          this.confirmingCancellation.set(false);
          this.success.set('El turno fue cancelado correctamente.');
        },
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
  }

  protected statusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = {
      scheduled: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Completado',
    };
    return labels[status];
  }
}
