import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { apiErrorMessage } from '../../core/api/api-error';
import { Appointment } from '../../core/models/api.models';

@Component({
  selector: 'app-appointment-list',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss',
})
export class AppointmentList {
  private readonly api = inject(ApiClientService);
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly nextPage = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly pendingCancellationId = signal<number | null>(null);
  protected readonly cancellingId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  protected load(page = 1): void {
    const initialLoad = page === 1;
    if (initialLoad) {
      this.loading.set(true);
      this.appointments.set([]);
    } else {
      this.loadingMore.set(true);
    }
    this.error.set('');

    this.api
      .appointments(page)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.loadingMore.set(false);
        }),
      )
      .subscribe({
        next: ({ data, meta }) => {
          this.appointments.update((current) => (initialLoad ? data : [...current, ...data]));
          this.nextPage.set(meta.next_page);
        },
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
  }

  protected canCancel(appointment: Appointment): boolean {
    return (
      appointment.status === 'scheduled' && new Date(appointment.starts_at).getTime() > Date.now()
    );
  }

  protected requestCancellation(id: number): void {
    this.success.set('');
    this.pendingCancellationId.set(id);
  }

  protected dismissCancellation(): void {
    this.pendingCancellationId.set(null);
  }

  protected cancel(appointment: Appointment): void {
    if (!this.canCancel(appointment) || this.cancellingId() !== null) return;

    this.cancellingId.set(appointment.id);
    this.error.set('');
    this.success.set('');
    this.api
      .cancelAppointment(appointment.id)
      .pipe(finalize(() => this.cancellingId.set(null)))
      .subscribe({
        next: ({ data }) => {
          this.appointments.update((items) =>
            items.map((item) => (item.id === data.id ? data : item)),
          );
          this.pendingCancellationId.set(null);
          this.success.set('El turno fue cancelado correctamente.');
        },
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
  }

  protected statusLabel(status: string): string {
    const labels: Record<string, string> = {
      scheduled: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Completado',
    };
    return labels[status] ?? status;
  }
}
