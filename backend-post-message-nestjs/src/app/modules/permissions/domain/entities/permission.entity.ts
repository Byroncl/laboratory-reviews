import {
  PERMISSIONS_CONFIG,
  PERMISSIONS_VALIDATION_MESSAGES,
  PERMISSION_TYPES,
} from '../../constants/permissions.constants';
import { DomainException } from '../../../../core/exceptions/app.exceptions';

export class PermissionEntity {
  readonly _id?: string;
  readonly name: string;
  readonly identifier: string;
  readonly type: string;
  readonly isActive: boolean;
  readonly isDeleted: boolean;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    _id?: string;
    name: string;
    identifier: string;
    type: string;
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validateName(props.name);
    this.validateIdentifier(props.identifier);
    this.validateType(props.type);

    this._id = props._id;
    this.name = props.name.trim();
    this.identifier = props.identifier.trim();
    this.type = props.type;
    this.isActive = props.isActive ?? true;
    this.isDeleted = props.isDeleted ?? false;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt;
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new DomainException(PERMISSIONS_VALIDATION_MESSAGES.NAME_REQUIRED);
    }
    if (name.length < PERMISSIONS_CONFIG.NAME_MIN_LENGTH) {
      throw new DomainException(PERMISSIONS_VALIDATION_MESSAGES.NAME_MIN_LENGTH);
    }
    if (name.length > PERMISSIONS_CONFIG.NAME_MAX_LENGTH) {
      throw new DomainException(PERMISSIONS_VALIDATION_MESSAGES.NAME_MAX_LENGTH);
    }
  }

  private validateIdentifier(identifier: string): void {
    if (!identifier || typeof identifier !== 'string') {
      throw new DomainException(PERMISSIONS_VALIDATION_MESSAGES.IDENTIFIER_REQUIRED);
    }
  }

  private validateType(type: string): void {
    if (!type || typeof type !== 'string') {
      throw new DomainException(PERMISSIONS_VALIDATION_MESSAGES.TYPE_REQUIRED);
    }
    const validTypes = Object.values(PERMISSION_TYPES);
    if (!(validTypes as string[]).includes(type)) {
      throw new DomainException(PERMISSIONS_VALIDATION_MESSAGES.TYPE_INVALID);
    }
  }

  update(props: Partial<{
    name: string;
    identifier: string;
    type: string;
    isActive: boolean;
  }>): PermissionEntity {
    if (props.name) {
      this.validateName(props.name);
    }
    if (props.identifier) {
      this.validateIdentifier(props.identifier);
    }
    if (props.type) {
      this.validateType(props.type);
    }

    return new PermissionEntity({
      _id: this._id,
      name: props.name ?? this.name,
      identifier: props.identifier ?? this.identifier,
      type: props.type ?? this.type,
      isActive: props.isActive ?? this.isActive,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  activate(): PermissionEntity {
    return this.update({ isActive: true });
  }

  deactivate(): PermissionEntity {
    return this.update({ isActive: false });
  }

  softDelete(): PermissionEntity {
    return new PermissionEntity({
      _id: this._id,
      name: this.name,
      identifier: this.identifier,
      type: this.type,
      isActive: this.isActive,
      isDeleted: true,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  isUserType(): boolean {
    return this.type === PERMISSION_TYPES.USER;
  }

  isRoleType(): boolean {
    return this.type === PERMISSION_TYPES.ROLES;
  }

  isPermissionType(): boolean {
    return this.type === PERMISSION_TYPES.PERMISSIONS;
  }

  isCommentType(): boolean {
    return this.type === PERMISSION_TYPES.COMMENTS;
  }

  isClientType(): boolean {
    return this.type === PERMISSION_TYPES.CLIENTS;
  }

  isStatisticsType(): boolean {
    return this.type === PERMISSION_TYPES.STATISTICS;
  }

  isAuditType(): boolean {
    return this.type === PERMISSION_TYPES.AUDITS;
  }
}
