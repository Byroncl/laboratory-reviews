import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUser, selectIsAuthenticated } from '../auth/store/auth.selectors';
import * as AuthActions from '../auth/store/auth.actions';
import { Observable } from 'rxjs';
import { AuthUser as User } from '../auth/models/auth.model';
import { SidebarComponent } from '../../core/components/sidebar.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LanguageSelectorComponent } from './components/language-selector.component';

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

  constructor(
    private store: Store,
    private router: Router
  ) {
    this.user$ = this.store.select(selectUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  ngOnInit(): void {}

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
