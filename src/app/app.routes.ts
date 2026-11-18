import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'servicios',
    loadComponent: () =>
      import('./features/services/service-list/service-list').then((m) => m.ServiceList),
  },
  {
    path: 'reservar/:serviceId',
    loadComponent: () => import('./features/booking/booking').then((m) => m.Booking),
  },
  {
    path: 'turnos',
    loadComponent: () =>
      import('./features/appointments/appointment-list').then((m) => m.AppointmentList),
    canActivate: [authGuard],
  },
  {
    path: 'turnos/:id',
    loadComponent: () =>
      import('./features/appointments/appointment-detail').then((m) => m.AppointmentDetail),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'ingresar',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
    canActivate: [guestGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'servicios' },
  { path: '**', redirectTo: 'servicios' },
];
