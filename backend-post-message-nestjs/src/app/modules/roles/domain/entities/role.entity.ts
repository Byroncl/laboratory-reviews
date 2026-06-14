import {
  ROLES_CONFIG,
  ROLES_VALIDATION_MESSAGES,
} from '../../constants/roles.constants';
import { DomainException } from '../../../core/exceptions/app.exceptions';

export class RoleEntity {
  readonly _id?: string;
  readonly name: string;
  readonly identifier: string;
  readonly description?: string;
  readonly permissions?: string[];
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    _id?: string;
    name: string;
    identifier: string;
    description?: string;
    permissions?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validateName(props.name);
    if (props.description) {
      this.validateDescription(props.description);
    }

    this._id = props._id;
    this.name = props.name.trim();
    this.identifier = props.identifier;
    this.description = props.description?.trim();
    this.permissions = props.permissions || [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt;
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new DomainException(ROLES_VALIDATION_MESSAGES.NAME_REQUIRED);
    }
    if (name.length < ROLES_CONFIG.NAME_MIN_LENGTH) {
      throw new DomainException(ROLES_VALIDATION_MESSAGES.NAME_MIN_LENGTH);
    }
    if (name.length > ROLES_CONFIG.NAME_MAX_LENGTH) {
      throw new DomainException(ROLES_VALIDATION_MESSAGES.NAME_MAX_LENGTH);
    }
  }

  private validateDescription(description: string): void {
    if (description.length > ROLES_CONFIG.DESCRIPTION_MAX_LENGTH) {
      throw new DomainException(ROLES_VALIDATION_MESSAGES.DESCRIPTION_MAX_LENGTH);
    }
  }

  update(props: Partial<{
    name: string;
    description: string;
  }>): RoleEntity {
    if (props.name) {
      this.validateName(props.name);
    }
    if (props.description) {
      this.validateDescription(props.description);
    }

    return new RoleEntity({
      _id: this._id,
      name: props.name ?? this.name,
      identifier: this.identifier,
      description: props.description ?? this.description,
      permissions: this.permissions,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  assignPermissions(permissionIds: string[]): RoleEntity {
    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      throw new DomainException(ROLES_VALIDATION_MESSAGES.PERMISSION_ID_REQUIRED);
    }

    return new RoleEntity({
      _id: this._id,
      name: this.name,
      identifier: this.identifier,
      description: this.description,
      permissions: permissionIds,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  hasPermission(permissionId: string): boolean {
    return (this.permissions || []).includes(permissionId);
  }

  removePermission(permissionId: string): RoleEntity {
    const updatedPermissions = (this.permissions || []).filter(
      p => p !== permissionId
    );

    return new RoleEntity({
      _id: this._id,
      name: this.name,
      identifier: this.identifier,
      description: this.description,
      permissions: updatedPermissions,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  isAdmin(): boolean {
    return this.identifier === 'admin';
  }

  isModerator(): boolean {
    return this.identifier === 'moderator';
  }

  isUser(): boolean {
    return this.identifier === 'user';
  }
}
