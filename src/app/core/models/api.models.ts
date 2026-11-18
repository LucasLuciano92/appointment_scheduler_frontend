export interface User {
  id: number;
  email_address: string;
  first_name: string;
  last_name: string;
  phone: string | null;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: string;
  image_url: string | null;
}

export interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  service_offering_id: number;
}

export interface Slot {
  starts_at: string;
  ends_at: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  next_page: number | null;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface AuthResponse extends ApiResponse<User> {
  token: string;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: Record<string, string[]> };
}

export type AppointmentStatus = 'scheduled' | 'cancelled' | 'completed';

export interface Appointment {
  id: number;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  service: Service;
  staff_member: Pick<StaffMember, 'id' | 'first_name' | 'last_name'>;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  token: string;
  user: User;
}
