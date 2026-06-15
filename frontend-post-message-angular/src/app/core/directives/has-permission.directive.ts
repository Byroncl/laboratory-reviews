import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { PermissionsService } from '../services/permissions.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit {
  private permissions: string[] = [];
  private requireAll = false;

  @Input()
  set appHasPermission(permission: string | string[]) {
    this.permissions = Array.isArray(permission) ? permission : [permission];
    this.updateView();
  }

  @Input()
  set appHasPermissionRequireAll(value: boolean) {
    this.requireAll = value;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const hasPermission = this.requireAll
      ? this.permissionsService.hasAllPermissions(this.permissions)
      : this.permissionsService.hasAnyPermission(this.permissions);

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
