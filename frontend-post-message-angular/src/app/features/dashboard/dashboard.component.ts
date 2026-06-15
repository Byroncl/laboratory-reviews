import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUser, selectIsAuthenticated } from '../auth/store/auth.selectors';
import * as AuthActions from '../auth/store/auth.actions';
import { Observable } from 'rxjs';
import { AuthUser as User } from '../auth/models/auth.model';
import { SidebarComponent } from '../../core/components/sidebar.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { PermissionsService } from '../../core/services/permissions.service';
import { NotificationsService } from '../../core/services/notifications.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    TranslatePipe,
    LanguageSelectorComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  isSidebarOpen = false;
  private permissionsService = inject(PermissionsService);
  private router = inject(Router);
  readonly notificationsService = inject(NotificationsService);
  readonly showNotificationsMenu = signal(false);

  constructor(
    private store: Store
  ) {
    this.user$ = this.store.select(selectUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  ngOnInit(): void {
    // All users here are admins (guard ensures this)
    // No need to redirect
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  isOverviewRoute(): boolean {
    return this.router.url === '/dashboard';
  }

  isAdmin(): boolean {
    return this.permissionsService.isAdmin();
  }

  toggleNotificationsMenu(): void {
    this.showNotificationsMenu.update(open => !open);
  }

  closeNotificationsMenu(): void {
    this.showNotificationsMenu.set(false);
  }

  markAsRead(notificationId: string): void {
    this.notificationsService.markAsRead(notificationId).subscribe();
  }
}
