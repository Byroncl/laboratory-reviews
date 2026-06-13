import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../features/auth/models/auth.model';
import { TranslatePipe } from '../pipes/translate.pipe';
import { I18nService } from '../services/i18n.service';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <aside
      class="w-64 bg-white shadow-lg h-screen flex flex-col border-r border-gray-200 overflow-y-auto fixed lg:relative left-0 top-0 z-40 transition-transform duration-300"
      [class.translate-x-0]="isOpen"
      [class.-translate-x-full]="!isOpen"
      [class.lg:translate-x-0]="true"
    >
      <!-- Logo -->
      <div class="p-6 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center gap-3">
          <img
            src="/images/logos/header-logo-2.png"
            alt="Albatros Logo"
            class="h-8 w-auto object-contain"
          />
          <h1 class="text-lg font-bold text-primary">Albatros</h1>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-6 space-y-2 overflow-y-auto">
        @for (item of menuItems; track item.id) {
          <div class="space-y-1">
            @if (item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="active"
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-gray-50 transition font-medium text-sm"
                [class.bg-gray-100]="isActive(item.route)"
                (click)="onMenuClick()"
              >
                <svg class="w-5 h-5 flex-shrink-0" [innerHTML]="getSvgIcon(item.icon)"></svg>
                <span>{{ item.label | t }}</span>
              </a>
            }

            @if (item.action && !item.route) {
              <button
                (click)="item.action()"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-gray-50 transition font-medium text-sm"
              >
                <svg class="w-5 h-5 flex-shrink-0" [innerHTML]="getSvgIcon(item.icon)"></svg>
                <span>{{ item.label | t }}</span>
              </button>
            }
          </div>
        }
      </nav>

      <!-- User Profile -->
      <div class="p-6 border-t border-gray-200 flex-shrink-0">
        @if (user$ | async; as user) {
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold text-sm">{{ user.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-primary truncate">{{ user.name }}</p>
                <p class="text-xs text-secondary truncate">{{ user.email }}</p>
              </div>
            </div>

            <button
              (click)="onLogout()"
              class="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              {{ 'sidebar.logout' | t }}
            </button>
          </div>
        }
      </div>
    </aside>

    <!-- Mobile Overlay -->
    @if (isOpen) {
      <div
        (click)="close.emit()"
        class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      ></div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    aside {
      @media (max-width: 1024px) {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 40;
      }
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Input() user$!: Observable<User | null>;
  @Output() close = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'sidebar.dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      id: 'posts',
      label: 'sidebar.posts',
      icon: 'posts',
      route: '/dashboard/posts'
    },
    {
      id: 'users',
      label: 'sidebar.users',
      icon: 'users',
      route: '/dashboard/users'
    },
    {
      id: 'roles',
      label: 'sidebar.roles',
      icon: 'roles',
      route: '/dashboard/roles'
    },
    {
      id: 'permissions',
      label: 'sidebar.permissions',
      icon: 'permissions',
      route: '/dashboard/permissions'
    },
    {
      id: 'comments',
      label: 'sidebar.comments',
      icon: 'comments',
      route: '/dashboard/comments'
    },
    {
      id: 'files',
      label: 'sidebar.files',
      icon: 'files',
      route: '/dashboard/files'
    }
  ];

  constructor(
    private router: Router,
    private i18n: I18nService
  ) {}

  getSvgIcon(iconName: string): string {
    const icons: Record<string, string> = {
      dashboard: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m-4 4L9 9m9 11l-4-4m4 4l4-4"></path>
      </svg>`,
      posts: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>`,
      users: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292m15 2.646a9 9 0 11-18 0m0 0a9 9 0 1018 0"></path>
      </svg>`,
      roles: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>`,
      permissions: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      comments: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2.586a1 1 0 00-.707.293l-4.414 4.414z"></path>
      </svg>`,
      files: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>`
    };
    return icons[iconName] || '';
  }

  onMenuClick(): void {
    if (window.innerWidth < 1024) {
      this.close.emit();
    }
  }

  onLogout(): void {
    this.logout.emit();
    this.close.emit();
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
