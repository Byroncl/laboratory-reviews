import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { authRoutes } from './features/auth/auth.routes';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    children: authRoutes
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
