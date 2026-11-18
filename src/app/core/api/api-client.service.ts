import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import {
  ApiResponse,
  Appointment,
  AppointmentStatus,
  PaginatedApiResponse,
  Service,
  Slot,
  StaffMember,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);

  services(): Observable<ApiResponse<Service[]>> {
    return this.http.get<ApiResponse<Service[]>>(`${API_URL}/services`);
  }

  service(id: number): Observable<ApiResponse<Service>> {
    return this.http.get<ApiResponse<Service>>(`${API_URL}/services/${id}`);
  }

  staff(serviceId: number): Observable<ApiResponse<StaffMember[]>> {
    return this.http.get<ApiResponse<StaffMember[]>>(
      `${API_URL}/services/${serviceId}/staff_members`,
    );
  }

  slots(offeringId: number, date: string): Observable<ApiResponse<Slot[]>> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ApiResponse<Slot[]>>(
      `${API_URL}/service_offerings/${offeringId}/available_slots`,
      { params },
    );
  }

  createAppointment(
    serviceOfferingId: number,
    startsAt: string,
    notes: string,
  ): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(`${API_URL}/appointments`, {
      appointment: {
        service_offering_id: serviceOfferingId,
        starts_at: startsAt,
        notes: notes || null,
      },
    });
  }

  appointments(
    page = 1,
    status: AppointmentStatus | '' = '',
  ): Observable<PaginatedApiResponse<Appointment>> {
    let params = new HttpParams().set('page', page);
    if (status) params = params.set('status', status);
    return this.http.get<PaginatedApiResponse<Appointment>>(`${API_URL}/appointments`, { params });
  }

  appointment(id: number): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${API_URL}/appointments/${id}`);
  }

  cancelAppointment(id: number): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(`${API_URL}/appointments/${id}/cancel`, {});
  }
}
