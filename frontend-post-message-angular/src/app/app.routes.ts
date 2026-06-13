import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { authRoutes } from './features/auth/auth.routes';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { OverviewComponent } from './features/dashboard/pages/overview.component';
import { PostsComponent } from './features/dashboard/pages/posts.component';
import { UsersComponent } from './features/dashboard/pages/users.component';
import { RolesComponent } from './features/dashboard/pages/roles.component';
import { PermissionsComponent } from './features/dashboard/pages/permissions.component';
import { CommentsComponent } from './features/dashboard/pages/comments.component';
import { FilesComponent } from './features/dashboard/pages/files.component';
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
    canActivate: [authGuard],
    children: [
      { path: '', component: OverviewComponent },
      { path: 'posts', component: PostsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'comments', component: CommentsComponent },
      { path: 'files', component: FilesComponent }
    ]
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
