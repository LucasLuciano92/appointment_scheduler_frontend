import { Routes } from '@angular/router';
import { PagePlaceholder } from './shared/page-placeholder/page-placeholder';

export const routes: Routes = [
  {
    path: 'servicios',
    component: PagePlaceholder,
    data: {
      title: 'Servicios',
      description: 'Elegí un servicio para comenzar a reservar tu turno.',
    },
  },
  {
    path: 'turnos',
    component: PagePlaceholder,
    data: { title: 'Mis turnos', description: 'Consultá y administrá tus próximas reservas.' },
  },
  {
    path: 'perfil',
    component: PagePlaceholder,
    data: { title: 'Mi perfil', description: 'Actualizá tus datos personales y preferencias.' },
  },
  {
    path: 'ingresar',
    component: PagePlaceholder,
    data: { title: 'Ingresar', description: 'Accedé con tu cuenta para gestionar turnos.' },
  },
  { path: '', pathMatch: 'full', redirectTo: 'servicios' },
  { path: '**', redirectTo: 'servicios' },
];
