import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { HasRoleDirective } from '../../core/directives/has-role.directive';
import { PermissionsService } from '../../core/services/permissions.service';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, HasPermissionDirective, HasRoleDirective],
  template: `
    <div class="client-layout">
      <div class="sidebar">
        <nav class="nav-menu">
          <ul>
            <!-- Solo visible si tiene permiso de crear_posts O es admin -->
            <li *appHasPermission="['create_posts', 'manage_posts']">
              <a routerLink="/client/my-posts" routerLinkActive="active">Mis Posts</a>
            </li>

            <!-- Solo visible si tiene permiso de crear_favoritos O es admin -->
            <li *appHasPermission="'create_favorites'">
              <a routerLink="/client/my-favorites" routerLinkActive="active">Mis Favoritos</a>
            </li>

            <!-- Siempre visible para clientes -->
            <li>
              <a routerLink="/client/my-comments" routerLinkActive="active">Mis Comentarios</a>
            </li>

            <!-- Siempre visible -->
            <li>
              <a routerLink="/client/profile" routerLinkActive="active">Mi Perfil</a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .client-layout {
        display: flex;
        min-height: calc(100vh - 60px);
        background-color: #f5f5f5;
      }

      .sidebar {
        width: 250px;
        background-color: #fff;
        border-right: 1px solid #ddd;
        padding: 20px 0;
      }

      .nav-menu ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .nav-menu li {
        margin: 0;
      }

      .nav-menu a {
        display: block;
        padding: 12px 20px;
        color: #666;
        text-decoration: none;
        border-left: 3px solid transparent;
        transition: all 0.3s;
      }

      .nav-menu a:hover {
        background-color: #f0f0f0;
        color: #333;
      }

      .nav-menu a.active {
        background-color: #f0f0f0;
        border-left-color: #007bff;
        color: #007bff;
        font-weight: 600;
      }

      .main-content {
        flex: 1;
        padding: 20px;
      }

      @media (max-width: 768px) {
        .client-layout {
          flex-direction: column;
        }

        .sidebar {
          width: 100%;
          border-right: none;
          border-bottom: 1px solid #ddd;
          padding: 10px 0;
        }

        .nav-menu ul {
          display: flex;
          flex-wrap: wrap;
        }

        .nav-menu li {
          flex: 1;
          min-width: 150px;
        }

        .nav-menu a {
          padding: 8px 12px;
          text-align: center;
          border-left: none;
          border-bottom: 3px solid transparent;
        }

        .nav-menu a.active {
          border-left: none;
          border-bottom-color: #007bff;
        }

        .main-content {
          padding: 15px;
        }
      }
    `,
  ],
})
export class ClientComponent {}
