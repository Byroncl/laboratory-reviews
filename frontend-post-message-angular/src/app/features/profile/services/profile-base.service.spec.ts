// services/profile-base.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';

import { ProfileBaseService } from './profile-base.service';
import { IUserProfile } from '../interfaces';
import { ApiService } from '../../../core/services/api.service';

// Concrete subclass to test the abstract base
@Injectable()
class TestProfileService extends ProfileBaseService<IUserProfile> {
  constructor(api: ApiService) {
    super(api);
  }

  public setCurrentUserPublic(user: IUserProfile | null): void {
    this._setCurrentUser(user);
  }

  public setLoadingPublic(loading: boolean): void {
    this._setLoading(loading);
  }

  public setSavingPublic(saving: boolean): void {
    this._setSaving(saving);
  }

  public setErrorPublic(error: string | null): void {
    this._setError(error);
  }

  public getIdPublic(entity: IUserProfile | null | undefined): string | null {
    return this._getId(entity);
  }
}

const mockUser: IUserProfile = {
  _id: 'user-1',
  name: 'Test',
  lastname: 'User',
  email: 'test@example.com',
  username: 'testuser',
};

describe('ProfileBaseService (via TestProfileService)', () => {
  let service: TestProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TestProfileService, ApiService],
    });
    service = TestBed.inject(TestProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null currentUser$', () => {
    expect(service.currentUser$()).toBeNull();
  });

  it('should initialize with isLoading false', () => {
    expect(service.isLoading()).toBeFalse();
  });

  it('should initialize with isSaving false', () => {
    expect(service.isSaving()).toBeFalse();
  });

  it('should initialize with hasError false', () => {
    expect(service.hasError()).toBeFalse();
  });

  it('should set currentUser$ via _setCurrentUser', () => {
    service.setCurrentUserPublic(mockUser);
    expect(service.currentUser$()).toEqual(mockUser);
  });

  it('should set currentUser$ to null', () => {
    service.setCurrentUserPublic(mockUser);
    service.setCurrentUserPublic(null);
    expect(service.currentUser$()).toBeNull();
  });

  it('should update isLoading via _setLoading', () => {
    service.setLoadingPublic(true);
    expect(service.isLoading()).toBeTrue();
    service.setLoadingPublic(false);
    expect(service.isLoading()).toBeFalse();
  });

  it('should update isSaving via _setSaving', () => {
    service.setSavingPublic(true);
    expect(service.isSaving()).toBeTrue();
    service.setSavingPublic(false);
    expect(service.isSaving()).toBeFalse();
  });

  it('should update hasError via _setError', () => {
    service.setErrorPublic('Something went wrong');
    expect(service.hasError()).toBeTrue();
    service.setErrorPublic(null);
    expect(service.hasError()).toBeFalse();
  });

  it('should return _id from _getId preferring it over id', () => {
    const user: IUserProfile = { ...mockUser, _id: 'from-_id', id: 'from-id' };
    expect(service.getIdPublic(user)).toBe('from-_id');
  });

  it('should return id from _getId when _id is absent', () => {
    const user: IUserProfile = {
      name: 'T',
      lastname: 'U',
      email: 'e@e.com',
      username: 'tu',
      id: 'from-id',
    };
    expect(service.getIdPublic(user)).toBe('from-id');
  });

  it('should return null from _getId when entity is null', () => {
    expect(service.getIdPublic(null)).toBeNull();
  });

  it('should return null from _getId when entity is undefined', () => {
    expect(service.getIdPublic(undefined)).toBeNull();
  });
});
