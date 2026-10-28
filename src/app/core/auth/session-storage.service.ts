import { Injectable, signal } from '@angular/core';
import { AuthSession } from '../models/api.models';

const SESSION_KEY = 'appointment_scheduler.session';

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  private readonly state = signal<AuthSession | null>(this.readStoredValue());
  readonly session = this.state.asReadonly();

  read(): AuthSession | null {
    return this.state();
  }

  write(session: AuthSession): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.state.set(session);
  }

  clear(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.state.set(null);
  }

  private readStoredValue(): AuthSession | null {
    const value = sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;

    try {
      return JSON.parse(value) as AuthSession;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
