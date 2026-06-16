import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../../shared/services/notification.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { PermissionsService } from '../../../admin/services/permissions.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-bulk-permission-upload',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, TranslatePipe],
  templateUrl: './bulk-permission-upload.component.html',
  styleUrl: './bulk-permission-upload.component.scss'
})
export class BulkPermissionUploadComponent implements OnInit, OnDestroy {
  @Output() uploadComplete = new EventEmitter<void>();
  @Output() uploadCancelled = new EventEmitter<void>();

  isLoading = false;
  dragOver = false;
  selectedFile: File | null = null;
  uploadedPermissions: any[] = [];
  showPreview = false;
  private destroy$ = new Subject<void>();

  constructor(
    private permissionsService: PermissionsService,
    private notificationService: NotificationService,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    // Component initialization if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.csv')) {
      this.notificationService.toast(
        this.i18n.translate('dashboard.permissions.invalidFileFormat'),
        'error'
      );
      return;
    }

    this.selectedFile = file;
    this.parseFile(file);
  }

  private parseFile(file: File): void {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const content = event.target?.result as string;

        if (file.name.endsWith('.json')) {
          this.uploadedPermissions = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          this.uploadedPermissions = this.parseCSV(content);
        }

        if (!Array.isArray(this.uploadedPermissions) || this.uploadedPermissions.length === 0) {
          throw new Error('Invalid format: must be an array of permissions');
        }

        this.showPreview = true;
        this.notificationService.toast(
          this.i18n.translate('dashboard.permissions.fileLoaded').replace('{count}', this.uploadedPermissions.length.toString()),
          'success'
        );
      } catch (error: any) {
        this.notificationService.toast(
          error.message || this.i18n.translate('dashboard.permissions.parseError'),
          'error'
        );
        this.selectedFile = null;
        this.uploadedPermissions = [];
      }
    };

    reader.readAsText(file);
  }

  private parseCSV(content: string): any[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const permissions = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const permission: any = {};

      headers.forEach((header, index) => {
        permission[header] = values[index] || '';
      });

      if (permission.name) {
        permissions.push(permission);
      }
    }

    return permissions;
  }

  onUpload(): void {
    if (!this.uploadedPermissions || this.uploadedPermissions.length === 0) {
      this.notificationService.toast(
        this.i18n.translate('dashboard.permissions.noPermissionsToUpload'),
        'error'
      );
      return;
    }

    this.isLoading = true;

    this.permissionsService
      .bulkCreatePermissions(this.uploadedPermissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.toast(
            this.i18n.translate('dashboard.permissions.bulkUploadSuccess').replace('{count}', this.uploadedPermissions.length.toString()),
            'success'
          );
          this.uploadComplete.emit();
        },
        error: (error: any) => {
          this.isLoading = false;
          this.notificationService.toast(
            error?.message || this.i18n.translate('dashboard.permissions.bulkUploadError'),
            'error'
          );
        }
      });
  }

  onCancel(): void {
    this.selectedFile = null;
    this.uploadedPermissions = [];
    this.showPreview = false;
    this.uploadCancelled.emit();
  }

  getPermissionPreview(permission: any): string {
    return `${permission.name || 'N/A'} - ${(permission.description || 'N/A').substring(0, 50)}...`;
  }
}
