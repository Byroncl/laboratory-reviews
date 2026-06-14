import { Injectable } from '@angular/core';
import { WebSocketService } from './websocket.service';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class RealtimeNotifierService {
  constructor(private wsService: WebSocketService) {
    this.setupListeners();
  }

  private setupListeners(): void {
    // User updates
    this.wsService.userCreated.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'User created',
          `${data.username || 'User'} created by ${data.createdBy}`,
          'success'
        );
      }
    });

    this.wsService.userUpdated.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'User updated',
          `${data.username || 'User'} updated by ${data.updatedBy}`,
          'info'
        );
      }
    });

    this.wsService.userDeleted.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'User deleted',
          `User deleted by ${data.deletedBy}`,
          'warning'
        );
      }
    });

    this.wsService.userActivated.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'User activated',
          `${data.username || 'User'} activated by ${data.activatedBy}`,
          'success'
        );
      }
    });

    this.wsService.userDeactivated.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'User deactivated',
          `${data.username || 'User'} deactivated by ${data.deactivatedBy}`,
          'warning'
        );
      }
    });

    // Post updates
    this.wsService.postCreated.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'Post created',
          `"${data.title || 'Post'}" created by ${data.createdBy}`,
          'success'
        );
      }
    });

    this.wsService.postUpdated.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'Post updated',
          `"${data.title || 'Post'}" updated by ${data.updatedBy}`,
          'info'
        );
      }
    });

    this.wsService.postDeleted.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'Post deleted',
          `Post deleted by ${data.deletedBy}`,
          'warning'
        );
      }
    });

    this.wsService.postPublished.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'Post published',
          `"${data.title || 'Post'}" published by ${data.publishedBy}`,
          'success'
        );
      }
    });

    // Role updates
    this.wsService.roleCreated.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'Role created',
          `"${data.name || 'Role'}" created by ${data.createdBy}`,
          'success'
        );
      }
    });

    this.wsService.roleUpdated.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'Role updated',
          `"${data.name || 'Role'}" updated by ${data.updatedBy}`,
          'info'
        );
      }
    });

    this.wsService.roleDeleted.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'Role deleted',
          `Role deleted by ${data.deletedBy}`,
          'warning'
        );
      }
    });

    // Permission updates
    this.wsService.permissionCreated.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'Permission created',
          `"${data.name || 'Permission'}" created by ${data.createdBy}`,
          'success'
        );
      }
    });

    this.wsService.permissionUpdated.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'Permission updated',
          `"${data.name || 'Permission'}" updated by ${data.updatedBy}`,
          'info'
        );
      }
    });

    this.wsService.permissionDeleted.subscribe((data) => {
      if (data) {
        this.showToast(
          data.message || 'Permission deleted',
          `Permission deleted by ${data.deletedBy}`,
          'warning'
        );
      }
    });
  }

  private showToast(
    title: string,
    description: string,
    icon: 'success' | 'info' | 'warning' | 'error'
  ): void {
    Swal.fire({
      title,
      text: description,
      icon,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  }
}
