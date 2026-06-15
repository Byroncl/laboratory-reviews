import { Component, OnInit, inject } from '@angular/core';
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

  constructor(
    private store: Store
  ) {
    this.user$ = this.store.select(selectUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  ngOnInit(): void {
    // Redirect clients to my-posts if on overview
    if (!this.permissionsService.isAdmin() && this.router.url === '/dashboard' || this.router.url === '/dashboard/') {
      this.router.navigate(['/dashboard/my-posts']);
    }
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
}
