import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile.component';

export const profileRoutes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    data: { title: 'Mi Perfil' }
  }
];
