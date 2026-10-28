import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { AuthResponse } from '../models/api.models';
import { SessionStorageService } from './session-storage.service';

export interface LoginCredentials {
  email_address: string;
  password: string;
}

export interface RegistrationData extends LoginCredentials {
  first_name: string;
  last_name: string;
  phone: string;
  password_confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(SessionStorageService);
  readonly session = this.storage.session;
  readonly authenticated = () => this.session() !== null;

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/session`, { session: credentials })
      .pipe(tap((response) => this.save(response)));
  }

  register(data: RegistrationData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/registration`, { user: data })
      .pipe(tap((response) => this.save(response)));
  }

  logout(): Observable<void> {
    return this.http.delete<void>(`${API_URL}/session`).pipe(finalize(() => this.clear()));
  }

  clear(): void {
    this.storage.clear();
  }

  private save(response: AuthResponse): void {
    const session = { token: response.token, user: response.data };
    this.storage.write(session);
  }
}
