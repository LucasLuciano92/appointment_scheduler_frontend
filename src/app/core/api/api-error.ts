import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from '../models/api.models';

export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as ApiErrorBody | undefined;
    if (body?.error?.message) return body.error.message;
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
  }
  return 'Ocurrió un error inesperado. Intentá nuevamente.';
}

export function apiFieldErrors(error: unknown): Record<string, string[]> {
  if (!(error instanceof HttpErrorResponse)) return {};
  const body = error.error as ApiErrorBody | undefined;
  return body?.error?.details ?? {};
}
