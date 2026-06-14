import {
  USERS_CONFIG,
  USERS_VALIDATION_MESSAGES,
  SUPPORTED_LANGUAGES,
} from '../../constants/users.constants';
import { DomainException } from '../../../core/exceptions/app.exceptions';

export class UserEntity {
  readonly _id?: string;
  readonly name: string;
  readonly lastname: string;
  readonly username: string;
  readonly email: string;
  readonly password_hash: string;
  readonly type: string;
  readonly avatar?: string;
  readonly bio?: string;
  readonly isActive: boolean;
  readonly isVerified: boolean;
  readonly language?: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    _id?: string;
    name: string;
    lastname: string;
    username: string;
    email: string;
    password_hash: string;
    type: string;
    avatar?: string;
    bio?: string;
    isActive?: boolean;
    isVerified?: boolean;
    language?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validateName(props.name);
    this.validateLastname(props.lastname);
    this.validateUsername(props.username);
    this.validateEmail(props.email);
    this.validatePassword(props.password_hash);
    this.validateType(props.type);
    if (props.bio) {
      this.validateBio(props.bio);
    }
    if (props.language) {
      this.validateLanguage(props.language);
    }

    this._id = props._id;
    this.name = props.name.trim();
    this.lastname = props.lastname.trim();
    this.username = props.username.trim().toLowerCase();
    this.email = props.email.trim().toLowerCase();
    this.password_hash = props.password_hash;
    this.type = props.type;
    this.avatar = props.avatar;
    this.bio = props.bio?.trim();
    this.isActive = props.isActive ?? true;
    this.isVerified = props.isVerified ?? false;
    this.language = props.language ?? 'en';
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt;
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new DomainException(USERS_VALIDATION_MESSAGES.NAME_REQUIRED);
    }
    if (name.length < USERS_CONFIG.NAME_MIN_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.NAME_MIN_LENGTH);
    }
    if (name.length > USERS_CONFIG.NAME_MAX_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.NAME_MAX_LENGTH);
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.NAME_PATTERN);
    }
  }

  private validateLastname(lastname: string): void {
    if (!lastname || typeof lastname !== 'string') {
      throw new DomainException(USERS_VALIDATION_MESSAGES.LASTNAME_REQUIRED);
    }
    if (lastname.length < USERS_CONFIG.NAME_MIN_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.LASTNAME_MIN_LENGTH);
    }
    if (lastname.length > USERS_CONFIG.NAME_MAX_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.LASTNAME_MAX_LENGTH);
    }
    if (!/^[a-zA-Z\s'-]+$/.test(lastname)) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.LASTNAME_PATTERN);
    }
  }

  private validateUsername(username: string): void {
    if (!username || typeof username !== 'string') {
      throw new DomainException(USERS_VALIDATION_MESSAGES.USERNAME_REQUIRED);
    }
    if (username.length < USERS_CONFIG.USERNAME_MIN_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.USERNAME_MIN_LENGTH);
    }
    if (username.length > USERS_CONFIG.USERNAME_MAX_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.USERNAME_MAX_LENGTH);
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.USERNAME_ALPHANUMERIC);
    }
  }

  private validateEmail(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new DomainException(USERS_VALIDATION_MESSAGES.EMAIL_REQUIRED);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.EMAIL_INVALID);
    }
    if (email.length > USERS_CONFIG.EMAIL_MAX_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.EMAIL_MAX_LENGTH);
    }
  }

  private validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new DomainException(USERS_VALIDATION_MESSAGES.PASSWORD_REQUIRED);
    }
    if (password.length < USERS_CONFIG.PASSWORD_MIN_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH);
    }
    if (password.length > USERS_CONFIG.PASSWORD_MAX_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.PASSWORD_MAX_LENGTH);
    }
  }

  private validateType(type: string): void {
    if (!type || typeof type !== 'string') {
      throw new DomainException(USERS_VALIDATION_MESSAGES.TYPE_REQUIRED);
    }
    if (type.length < USERS_CONFIG.TYPE_MIN_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.TYPE_MIN_LENGTH);
    }
    if (type.length > USERS_CONFIG.TYPE_MAX_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.TYPE_MAX_LENGTH);
    }
  }

  private validateBio(bio: string): void {
    if (bio && bio.length > USERS_CONFIG.BIO_MAX_LENGTH) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.BIO_MAX_LENGTH);
    }
  }

  private validateLanguage(language: string): void {
    const supportedLanguages = Object.values(SUPPORTED_LANGUAGES);
    if (!supportedLanguages.includes(language)) {
      throw new DomainException(USERS_VALIDATION_MESSAGES.BIO_MAX_LENGTH);
    }
  }

  update(props: Partial<{
    name: string;
    lastname: string;
    avatar: string;
    bio: string;
    language: string;
  }>): UserEntity {
    if (props.name) {
      this.validateName(props.name);
    }
    if (props.lastname) {
      this.validateLastname(props.lastname);
    }
    if (props.bio) {
      this.validateBio(props.bio);
    }
    if (props.language) {
      this.validateLanguage(props.language);
    }

    return new UserEntity({
      _id: this._id,
      name: props.name ?? this.name,
      lastname: props.lastname ?? this.lastname,
      username: this.username,
      email: this.email,
      password_hash: this.password_hash,
      type: this.type,
      avatar: props.avatar ?? this.avatar,
      bio: props.bio ?? this.bio,
      isActive: this.isActive,
      isVerified: this.isVerified,
      language: props.language ?? this.language,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  activate(): UserEntity {
    return new UserEntity({
      _id: this._id,
      name: this.name,
      lastname: this.lastname,
      username: this.username,
      email: this.email,
      password_hash: this.password_hash,
      type: this.type,
      avatar: this.avatar,
      bio: this.bio,
      isActive: true,
      isVerified: this.isVerified,
      language: this.language,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  deactivate(): UserEntity {
    return new UserEntity({
      _id: this._id,
      name: this.name,
      lastname: this.lastname,
      username: this.username,
      email: this.email,
      password_hash: this.password_hash,
      type: this.type,
      avatar: this.avatar,
      bio: this.bio,
      isActive: false,
      isVerified: this.isVerified,
      language: this.language,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  verify(): UserEntity {
    return new UserEntity({
      _id: this._id,
      name: this.name,
      lastname: this.lastname,
      username: this.username,
      email: this.email,
      password_hash: this.password_hash,
      type: this.type,
      avatar: this.avatar,
      bio: this.bio,
      isActive: this.isActive,
      isVerified: true,
      language: this.language,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  updatePassword(newPasswordHash: string): UserEntity {
    this.validatePassword(newPasswordHash);
    return new UserEntity({
      _id: this._id,
      name: this.name,
      lastname: this.lastname,
      username: this.username,
      email: this.email,
      password_hash: newPasswordHash,
      type: this.type,
      avatar: this.avatar,
      bio: this.bio,
      isActive: this.isActive,
      isVerified: this.isVerified,
      language: this.language,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  updateLanguage(language: string): UserEntity {
    this.validateLanguage(language);
    return this.update({ language });
  }

  isAdmin(): boolean {
    return this.type === 'admin';
  }

  isModerator(): boolean {
    return this.type === 'moderator';
  }

  isRegularUser(): boolean {
    return this.type === 'user';
  }
}
