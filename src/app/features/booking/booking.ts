import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { apiErrorMessage } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { BookingDraftService } from '../../core/booking/booking-draft.service';
import { Appointment, Service, Slot, StaffMember } from '../../core/models/api.models';

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
  private readonly drafts = inject(BookingDraftService);
  private serviceId = 0;
  private draftSlotStartsAt = '';
  protected readonly auth = inject(AuthService);
  protected readonly service = signal<Service | null>(null);
  protected readonly staff = signal<StaffMember[]>([]);
  protected readonly slots = signal<Slot[]>([]);
  protected readonly selectedStaff = signal<StaffMember | null>(null);
  protected readonly selectedSlot = signal<Slot | null>(null);
  protected readonly loading = signal(true);
  protected readonly slotsLoading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly confirmedAppointment = signal<Appointment | null>(null);
  protected date = '';
  protected notes = '';
  protected readonly minDate = this.localDate(new Date());
  protected readonly canSubmit = computed(
    () => Boolean(this.selectedStaff() && this.selectedSlot()) && !this.submitting(),
  );

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('serviceId'));
    if (!Number.isInteger(id) || id < 1) {
      void this.router.navigate(['/servicios']);
      return;
    }
    this.serviceId = id;
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service.set(null);
    forkJoin({
      service: this.api.service(this.serviceId),
      staff: this.api.staff(this.serviceId),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ service, staff }) => {
          this.service.set(service.data);
          this.staff.set(staff.data);
          this.restoreDraft(staff.data);
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
    this.selectedSlot.set(null);
    this.slots.set([]);
    this.slotsLoading.set(true);
    this.api
      .slots(member.service_offering_id, this.date)
      .pipe(finalize(() => this.slotsLoading.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.slots.set(data);
          if (this.draftSlotStartsAt) {
            this.selectedSlot.set(
              data.find((slot) => slot.starts_at === this.draftSlotStartsAt) ?? null,
            );
            this.draftSlotStartsAt = '';
          }
        },
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
  }

  protected reserve(): void {
    const member = this.selectedStaff();
    const slot = this.selectedSlot();
    if (!member || !slot) return;
    if (!this.auth.session()) {
      this.drafts.write({
        serviceId: this.serviceId,
        serviceOfferingId: member.service_offering_id,
        date: this.date,
        slotStartsAt: slot.starts_at,
        notes: this.notes,
      });
      void this.router.navigate(['/ingresar'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    this.api
      .createAppointment(member.service_offering_id, slot.starts_at, this.notes)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.confirmedAppointment.set(data);
          this.success.set('Tu turno quedó confirmado.');
          this.drafts.clear();
          this.slots.update((slots) => slots.filter((item) => item.starts_at !== slot.starts_at));
          this.selectedSlot.set(null);
        },
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
  }

  private restoreDraft(staff: StaffMember[]): void {
    const draft = this.drafts.read(this.serviceId);
    if (!draft) return;

    const member = staff.find(
      (candidate) => candidate.service_offering_id === draft.serviceOfferingId,
    );
    if (!member) {
      this.drafts.clear();
      return;
    }

    this.selectedStaff.set(member);
    this.date = draft.date;
    this.notes = draft.notes;
    this.draftSlotStartsAt = draft.slotStartsAt;
    this.loadSlots();
  }

  private localDate(date: Date): string {
    const localTime = date.getTime() - date.getTimezoneOffset() * 60_000;
    return new Date(localTime).toISOString().slice(0, 10);
  }
}
