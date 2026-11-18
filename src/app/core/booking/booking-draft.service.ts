import { Injectable } from '@angular/core';

const BOOKING_DRAFT_KEY = 'appointment_scheduler.booking_draft';

export interface BookingDraft {
  serviceId: number;
  serviceOfferingId: number;
  date: string;
  slotStartsAt: string;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class BookingDraftService {
  read(serviceId: number): BookingDraft | null {
    const value = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    if (!value) return null;

    try {
      const draft = JSON.parse(value) as Partial<BookingDraft>;
      if (
        draft.serviceId !== serviceId ||
        !Number.isInteger(draft.serviceOfferingId) ||
        typeof draft.date !== 'string' ||
        typeof draft.slotStartsAt !== 'string' ||
        typeof draft.notes !== 'string'
      ) {
        this.clear();
        return null;
      }
      return draft as BookingDraft;
    } catch {
      this.clear();
      return null;
    }
  }

  write(draft: BookingDraft): void {
    sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
  }

  clear(): void {
    sessionStorage.removeItem(BOOKING_DRAFT_KEY);
  }
}
