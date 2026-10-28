export type UserRole = 'admin' | 'customer';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  active: boolean;
}

export interface Appointment {
  id: number;
  starts_at: string;
  ends_at: string;
  status: string;
  notes: string | null;
  service: Service;
  staff_member: StaffMember;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
