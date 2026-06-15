import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { authRoutes } from './features/auth/auth.routes';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { OverviewComponent } from './features/dashboard/pages/overview.component';
import { UsersComponent } from './features/dashboard/pages/users.component';
import { RolesComponent } from './features/dashboard/pages/roles.component';
import { PermissionsComponent } from './features/dashboard/pages/permissions.component';
import { AuditLogsComponent } from './features/dashboard/pages/audit-logs.component';
import { FilesComponent } from './features/dashboard/pages/files.component';
import { HomeComponent } from './features/home/pages/home.component';
import { PostDetailComponent } from './features/posts/pages/post-detail.component';
import { authGuard } from './core/guards/auth.guard';
import { dashboardGuard } from './core/guards/permission.guard';
import { postsRoutes } from './features/posts/posts.routes';
import { profileRoutes } from './features/profile/profile.routes';
import { CLIENT_ROUTES } from './features/client/client.routes';
import { MyPostsComponent } from './features/client/pages/my-posts/my-posts.component';
import { MyFavoritesComponent } from './features/client/pages/my-favorites/my-favorites.component';
import { MyCommentsComponent } from './features/client/pages/my-comments/my-comments.component';
import { FeedComponent } from './features/client/pages/feed/feed.component';

export const routes: Routes = [
  // Public routes (no authGuard)
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'home',
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
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'client/*',
    redirectTo: 'home',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, dashboardGuard],
    children: [
      { path: '', component: OverviewComponent },
      { path: 'posts', children: postsRoutes },
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'files', component: FilesComponent },
      { path: 'profile', children: profileRoutes },
      { path: 'audit-logs', component: AuditLogsComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
