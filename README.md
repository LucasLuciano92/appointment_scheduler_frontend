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

## Estado de la etapa 2

Esta etapa establece el repositorio independiente, la configuración de Angular, el contrato de
modelos compartidos, el almacenamiento de sesión, la navegación inicial y la integración continua.
Las pantallas todavía son marcadores de posición: autenticación, servicios, reservas, turnos y
perfil se implementarán de forma incremental en las siguientes etapas.
