import {
  CLIENT_VALIDATION,
  CLIENT_PATTERNS,
  CLIENT_VALIDATION_MESSAGES,
} from '../../constants/client.constants';
import { DomainException } from '../../../../core/exceptions/app.exceptions';

export class ClientEntity {
  readonly _id?: string;
  readonly name: string;
  readonly lastname: string;
  readonly username: string;
  readonly email: string;
  readonly password_hash: string;
  readonly type: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(data: any) {
    this.validateName(data.name);
    this.validateLastname(data.lastname);
    this.validateUsername(data.username);
    this.validateEmail(data.email);
    this.validatePassword(data.password_hash);
    this.validateType(data.type);

    Object.defineProperties(this, {
      _id: { value: data._id, writable: false, enumerable: true },
      name: { value: data.name, writable: false, enumerable: true },
      lastname: { value: data.lastname, writable: false, enumerable: true },
      username: { value: data.username, writable: false, enumerable: true },
      email: { value: data.email, writable: false, enumerable: true },
      password_hash: {
        value: data.password_hash,
        writable: false,
        enumerable: true,
      },
      type: { value: data.type, writable: false, enumerable: true },
      isActive: {
        value: data.isActive ?? true,
        writable: false,
        enumerable: true,
      },
      createdAt: {
        value: data.createdAt ?? new Date(),
        writable: false,
        enumerable: true,
      },
      updatedAt: {
        value: data.updatedAt ?? new Date(),
        writable: false,
        enumerable: true,
      },
    });
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.NAME_REQUIRED);
    }
    if (
      name.length < CLIENT_VALIDATION.NAME_MIN_LENGTH ||
      name.length > CLIENT_VALIDATION.NAME_MAX_LENGTH
    ) {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.NAME_MIN_LENGTH);
    }
    if (!CLIENT_PATTERNS.NAME_LASTNAME.test(name)) {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.NAME_PATTERN);
    }
  }

  private validateLastname(lastname: string): void {
    if (!lastname || typeof lastname !== 'string') {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.LASTNAME_REQUIRED);
    }
    if (
      lastname.length < CLIENT_VALIDATION.LASTNAME_MIN_LENGTH ||
      lastname.length > CLIENT_VALIDATION.LASTNAME_MAX_LENGTH
    ) {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.LASTNAME_MIN_LENGTH);
    }
    if (!CLIENT_PATTERNS.NAME_LASTNAME.test(lastname)) {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.LASTNAME_PATTERN);
    }
  }

  private validateUsername(username: string): void {
    if (!username || typeof username !== 'string') {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.USERNAME_REQUIRED);
    }
    if (
      username.length < CLIENT_VALIDATION.USERNAME_MIN_LENGTH ||
      username.length > CLIENT_VALIDATION.USERNAME_MAX_LENGTH
    ) {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.USERNAME_MIN_LENGTH);
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.USERNAME_ALPHANUMERIC);
    }
  }

  private validateEmail(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.EMAIL_REQUIRED);
    }
    if (email.length > CLIENT_VALIDATION.EMAIL_MAX_LENGTH) {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.EMAIL_MAX_LENGTH);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.EMAIL_INVALID);
    }
  }

  private validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.PASSWORD_REQUIRED);
    }
    if (
      password.length < CLIENT_VALIDATION.PASSWORD_MIN_LENGTH ||
      password.length > CLIENT_VALIDATION.PASSWORD_MAX_LENGTH
    ) {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH);
    }
  }

  private validateType(type: string): void {
    if (!type || typeof type !== 'string') {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.TYPE_REQUIRED);
    }
    if (
      type.length < CLIENT_VALIDATION.TYPE_MIN_LENGTH ||
      type.length > CLIENT_VALIDATION.TYPE_MAX_LENGTH
    ) {
      throw new DomainException(CLIENT_VALIDATION_MESSAGES.TYPE_MIN_LENGTH);
    }
  }

  update(data: Partial<any>): ClientEntity {
    return new ClientEntity({
      _id: this._id,
      name: data.name ?? this.name,
      lastname: data.lastname ?? this.lastname,
      username: data.username ?? this.username,
      email: data.email ?? this.email,
      password_hash: data.password_hash ?? this.password_hash,
      type: data.type ?? this.type,
      isActive: data.isActive ?? this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  activate(): ClientEntity {
    return new ClientEntity({
      _id: this._id,
      name: this.name,
      lastname: this.lastname,
      username: this.username,
      email: this.email,
      password_hash: this.password_hash,
      type: this.type,
      isActive: true,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  deactivate(): ClientEntity {
    return new ClientEntity({
      _id: this._id,
      name: this.name,
      lastname: this.lastname,
      username: this.username,
      email: this.email,
      password_hash: this.password_hash,
      type: this.type,
      isActive: false,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
