import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

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
      import('./shared/page-placeholder/page-placeholder').then((m) => m.PagePlaceholder),
    canActivate: [authGuard],
    data: { title: 'Mis turnos', description: 'Consultá y administrá tus próximas reservas.' },
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./shared/page-placeholder/page-placeholder').then((m) => m.PagePlaceholder),
    canActivate: [authGuard],
    data: { title: 'Mi perfil', description: 'Actualizá tus datos personales y preferencias.' },
  },
  {
    path: 'ingresar',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  { path: '', pathMatch: 'full', redirectTo: 'servicios' },
  { path: '**', redirectTo: 'servicios' },
];
