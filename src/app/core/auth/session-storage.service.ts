import { Injectable } from '@angular/core';
import { AuthSession } from '../models/api.models';

const SESSION_KEY = 'appointment_scheduler.session';

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  read(): AuthSession | null {
    const value = sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;

    try {
      return JSON.parse(value) as AuthSession;
    } catch {
      this.clear();
      return null;
    }
  }

  write(session: AuthSession): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clear(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }
}
