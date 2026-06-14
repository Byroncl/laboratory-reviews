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
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent {}
