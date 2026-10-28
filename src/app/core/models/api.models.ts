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

export interface AuthResponse extends ApiResponse<User> {
  token: string;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: Record<string, string[]> };
}

export interface Appointment {
  id: number;
  starts_at: string;
  ends_at: string;
  status: string;
  notes: string | null;
  service: Service;
  staff_member: StaffMember;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  token: string;
  user: User;
}
