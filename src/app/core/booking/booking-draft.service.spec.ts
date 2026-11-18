import { TestBed } from '@angular/core/testing';
import { BookingDraftService } from './booking-draft.service';

describe('BookingDraftService', () => {
  let service: BookingDraftService;

  beforeEach(() => {
    sessionStorage.clear();
    service = TestBed.inject(BookingDraftService);
  });

  afterEach(() => sessionStorage.clear());

  it('stores and restores a draft for the requested service', () => {
    const draft = {
      serviceId: 3,
      serviceOfferingId: 9,
      date: '2030-01-08',
      slotStartsAt: '2030-01-08T10:00:00-03:00',
      notes: 'Sin perfume',
    };

    service.write(draft);

    expect(service.read(3)).toEqual(draft);
    expect(service.read(4)).toBeNull();
  });

  it('removes malformed drafts', () => {
    sessionStorage.setItem('appointment_scheduler.booking_draft', '{invalid');

    expect(service.read(3)).toBeNull();
    expect(sessionStorage.getItem('appointment_scheduler.booking_draft')).toBeNull();
  });
});
