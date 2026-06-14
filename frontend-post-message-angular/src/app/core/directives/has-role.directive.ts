import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { PermissionsService } from '../services/permissions.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit {
  private roles: string[] = [];

  @Input()
  set appHasRole(role: string | string[]) {
    this.roles = Array.isArray(role) ? role : [role];
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
    const hasRole = this.roles.some(role => this.permissionsService.hasRole(role));

    if (hasRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
