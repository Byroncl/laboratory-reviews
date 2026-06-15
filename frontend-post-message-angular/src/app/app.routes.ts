import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { authRoutes } from './features/auth/auth.routes';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { OverviewComponent } from './features/dashboard/pages/overview.component';
import { UsersComponent } from './features/dashboard/pages/users.component';
import { RolesComponent } from './features/dashboard/pages/roles.component';
import { PermissionsComponent } from './features/dashboard/pages/permissions.component';
import { AuditLogsComponent } from './features/dashboard/pages/audit-logs.component';
import { CommentsComponent } from './features/dashboard/pages/comments.component';
import { FilesComponent } from './features/dashboard/pages/files.component';
import { HomeComponent } from './features/home/pages/home.component';
import { PostDetailComponent } from './features/posts/pages/post-detail.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/permission.guard';
import { postsRoutes } from './features/posts/posts.routes';
import { profileRoutes } from './features/profile/profile.routes';
import { CLIENT_ROUTES } from './features/client/client.routes';

export const routes: Routes = [
  // Public routes (no authGuard)
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'posts/:id',
    component: PostDetailComponent,
  },
  {
    path: 'auth',
    component: AuthComponent,
    children: authRoutes,
  },
  {
    path: 'client',
    canActivate: [authGuard],
    children: CLIENT_ROUTES,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', component: OverviewComponent },
      { path: 'posts', children: postsRoutes },
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'comments', component: CommentsComponent },
      { path: 'files', component: FilesComponent },
      { path: 'profile', children: profileRoutes },
      { path: 'audit-logs', component: AuditLogsComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
