# Appointment Scheduler · Frontend

Cliente web del TP2 de Programación IV. Está construido con Angular y consume la API Rails de
[`appointment_scheduler`](https://github.com/LucasLuciano92/appointment_scheduler).

## Requisitos

- Node.js 24.14.1 (ver `.nvmrc`)
- npm 11 o superior
- API Rails ejecutándose en `http://localhost:3000`

## Puesta en marcha

```bash
npm ci
npm start
```

La aplicación queda disponible en `http://localhost:4200`. La URL base de la API está centralizada
en `src/environments/environment.ts` y apunta a `http://localhost:3000/api/v1`.

## Verificación

```bash
npm run format:check
npm run test:ci
npm run build
npm audit --omit=dev --audit-level=high
```

## Estado de la etapa 3

La primera integración con Rails incluye:

- registro, login y logout reales;
- sesión por pestaña en `sessionStorage`;
- token bearer automático y recuperación global ante respuestas `401`;
- guardas para turnos y perfil;
- catálogo con estados de carga, vacío y error;
- selección de profesional, fecha y horario, y creación de una reserva real.

El historial y cancelación de turnos, la edición de perfil y la revisión final de accesibilidad se
completarán en la etapa 4.
