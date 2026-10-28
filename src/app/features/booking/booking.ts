import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { apiErrorMessage } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { Service, Slot, StaffMember } from '../../core/models/api.models';

@Component({
  selector: 'app-booking',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiClientService);
  protected readonly auth = inject(AuthService);
  protected readonly service = signal<Service | null>(null);
  protected readonly staff = signal<StaffMember[]>([]);
  protected readonly slots = signal<Slot[]>([]);
  protected readonly selectedStaff = signal<StaffMember | null>(null);
  protected readonly selectedSlot = signal<Slot | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected date = '';
  protected notes = '';
  protected readonly minDate = new Date().toISOString().slice(0, 10);
  protected readonly canSubmit = computed(
    () => Boolean(this.selectedStaff() && this.selectedSlot()) && !this.submitting(),
  );

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('serviceId'));
    if (!Number.isInteger(id) || id < 1) {
      void this.router.navigate(['/servicios']);
      return;
    }
    forkJoin({ service: this.api.service(id), staff: this.api.staff(id) })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ service, staff }) => {
          this.service.set(service.data);
          this.staff.set(staff.data);
        },
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
  }

  protected chooseStaff(member: StaffMember): void {
    this.selectedStaff.set(member);
    this.selectedSlot.set(null);
    this.slots.set([]);
    if (this.date) this.loadSlots();
  }

  protected loadSlots(): void {
    const member = this.selectedStaff();
    if (!member || !this.date) return;
    this.error.set('');
    this.api.slots(member.service_offering_id, this.date).subscribe({
      next: ({ data }) => this.slots.set(data),
      error: (error) => this.error.set(apiErrorMessage(error)),
    });
  }

  protected reserve(): void {
    const member = this.selectedStaff();
    const slot = this.selectedSlot();
    if (!member || !slot) return;
    if (!this.auth.session()) {
      void this.router.navigate(['/ingresar'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    this.api
      .createAppointment(member.service_offering_id, slot.starts_at, this.notes)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.success.set('Tu turno quedó confirmado.');
          this.slots.update((slots) => slots.filter((item) => item.starts_at !== slot.starts_at));
          this.selectedSlot.set(null);
        },
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
  }
}
