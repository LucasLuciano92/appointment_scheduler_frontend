# Appointment Scheduler · Frontend

Cliente web del Trabajo Práctico N.º 2 de Programación IV para gestionar turnos
de un salón o centro de estética de una sola sede.

## Proyecto

- **Modalidad:** trabajo individual.
- **Integrante:** Lucas Luciano.
- **Back-end original:** Lucas Luciano.
- **Front-end:** Angular 21 con TypeScript y componentes standalone.
- **Back-end:** Ruby on Rails 8.1, disponible en
  [`appointment_scheduler`](https://github.com/LucasLuciano92/appointment_scheduler).

La administración continúa en el back-office de Rails. Esta aplicación está
orientada al cliente final y consume exclusivamente la API JSON bajo `/api/v1`.

## Funcionalidades

- registro, inicio y cierre de sesión con token bearer;
- recuperación global ante sesiones inválidas o vencidas;
- catálogo de servicios con imágenes, precios y duración;
- selección de profesional, fecha y horario disponible;
- creación de reservas con confirmación y manejo de errores;
- historial paginado de turnos propios y cancelación de turnos futuros;
- consulta y edición de perfil, incluido el cambio de contraseña;
- estados de carga, vacío, error y confirmación en los flujos principales;
- navegación responsive y utilizable mediante teclado.

## Requisitos

### Front-end

- Node.js 24.14.1, indicado en `.nvmrc`.
- npm 11 o superior.

### Back-end

- Ruby 3.4.10.
- Bundler y herramientas para compilar las dependencias nativas.
- SQLite, incluido en la configuración del proyecto Rails.

## Puesta en marcha integrada

### 1. API Rails

```powershell
git clone https://github.com/LucasLuciano92/appointment_scheduler.git
cd appointment_scheduler
bundle install
bin/rails db:prepare
$env:DEMO_ADMIN_PASSWORD = "admin-pass-123"
$env:DEMO_CUSTOMER_PASSWORD = "customer-pass-123"
bundle exec rails demo:setup
bin/rails server
```

El comando de demostración crea datos de forma idempotente y solo fuera de
producción:

- cliente: `cliente.demo@example.com`;
- administrador: `admin.demo@example.com`;
- contraseñas: los valores definidos localmente en las variables anteriores.

La API queda disponible en `http://localhost:3000/api/v1` y el back-office en
`http://localhost:3000/admin`.

### 2. Aplicación Angular

En otra terminal:

```powershell
git clone https://github.com/LucasLuciano92/appointment_scheduler_frontend.git
cd appointment_scheduler_frontend
npm ci
npm start
```

Abrir `http://localhost:4200` e ingresar con la cuenta de cliente de
demostración.

## Configuración

La URL base está centralizada en `src/environments/environment.ts` y apunta a
`http://localhost:3000/api/v1`. El repositorio no contiene secretos.

Para otro origen o un despliegue, actualizar la URL del front-end y declarar el
origen exacto en `API_ALLOWED_ORIGINS` del back-end. Las variables y opciones de
producción están documentadas en el
[README de Rails](https://github.com/LucasLuciano92/appointment_scheduler#configuración).

## Contrato de la API

El contrato utilizado por Angular documenta autenticación, permisos, campos,
validaciones, respuestas y ejemplos reproducibles:

- [Contrato completo del TP2](https://github.com/LucasLuciano92/appointment_scheduler/blob/main/docs/tp2_api_contract.md).
- [Resumen de endpoints](https://github.com/LucasLuciano92/appointment_scheduler#api-json).

## Verificación

### Front-end

```powershell
npm run format:check
npm run test:ci
npm run build
npm audit --omit=dev --audit-level=high
```

La suite cubre autenticación, sesión, interceptor, creación y cancelación de
reservas, errores de API y actualización de perfil.

### Back-end

Desde el repositorio Rails:

```powershell
bundle exec rspec --exclude-pattern "spec/system/**/*_spec.rb"
bundle exec rspec spec/system
bin/rubocop
bin/rails zeitwerk:check
bin/brakeman --no-pager --exit-on-warn --exit-on-error
```

## Estado de la entrega

La etapa 4 completa la integración prevista: autenticación, catálogo, reserva,
historial, cancelación, perfil, pruebas y revisión responsive/accesible. El
deploy público es opcional y no se incluye mientras no exista un servidor y un
dominio definitivos.
