// services/profile.service.spec.ts
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { ProfileService } from './profile.service';
import { ApiService } from '../../../core/services/api.service';
import { selectAuthUser } from '../../auth/store/auth.selectors';
import { IUserProfile, IProfileResponse } from '../interfaces';
import { PROFILE_MESSAGES } from '../constants';

import { AuthUser } from '../../auth/models/auth.model';

const mockAuthUser: AuthUser = {
  id: 'user-1',
  username: 'johndoe',
  role: 'user',
  email: 'auth@example.com',
};

const mockProfile: IUserProfile = {
  _id: 'user-1',
  name: 'John',
  lastname: 'Doe',
  email: 'john@example.com',
  username: 'johndoe',
};

const mockProfileResponse: IProfileResponse = {
  data: mockProfile,
  message: 'OK',
};

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  let store: MockStore;

  function flushInitialLoad(): void {
    // The constructor triggers loadUserProfile via store auth user
    const req = httpMock.expectOne((r) => r.url.includes('/users/profile'));
    req.flush(mockProfileResponse);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProfileService,
        ApiService,
        provideMockStore({
          initialState: { auth: { user: mockAuthUser, isAuthenticated: true } },
        }),
      ],
    });

    // Drain the constructor-triggered HTTP call before each test
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectAuthUser, mockAuthUser);
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);

    flushInitialLoad();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load profile and set currentUser signal', fakeAsync(() => {
    service.loadUserProfile().subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/users/profile'));
    req.flush(mockProfileResponse);

    tick();
    expect(service.currentUser()).toEqual(mockProfile);
  }));

  it('should set loading to true during request and false after', fakeAsync(() => {
    service.loadUserProfile().subscribe();
    expect(service.loading()).toBeTrue();

    const req = httpMock.expectOne((r) => r.url.includes('/users/profile'));
    req.flush(mockProfileResponse);

    tick();
    expect(service.loading()).toBeFalse();
  }));

  it('should set error signal on failed loadUserProfile', fakeAsync(() => {
    let errorThrown = false;
    service.loadUserProfile().subscribe({ error: () => { errorThrown = true; } });

    const reqs = httpMock.match((r) => r.url.includes('/users/profile'));
    reqs.forEach((r) => r.flush('Error', { status: 500, statusText: 'Server Error' }));

    tick();
    expect(service.hasError()).toBeTrue();
    expect(errorThrown).toBeTrue();
  }));

  it('should update currentUser after successful updateProfile', fakeAsync(() => {
    // currentUser is already set from the beforeEach constructor load
    const updatedUser: IUserProfile = { ...mockProfile, name: 'Updated' };
    service.updateProfile({ name: 'Updated' }).subscribe();

    const req = httpMock.expectOne((r) =>
      r.url.includes('/users/user-1') && r.method === 'PUT',
    );
    req.flush({ data: updatedUser, message: 'Updated' });

    tick();
    expect(service.currentUser()?.name).toBe('Updated');
  }));

  it('should set saving to true during updateProfile and false after', fakeAsync(() => {
    service.updateProfile({ name: 'Test' }).subscribe();
    expect(service.saving()).toBeTrue();

    const req = httpMock.expectOne((r) =>
      r.url.includes('/users/user-1') && r.method === 'PUT',
    );
    req.flush({ data: mockProfile, message: 'OK' });

    tick();
    expect(service.saving()).toBeFalse();
  }));

  it('should set error on failed updateProfile', fakeAsync(() => {
    let errorThrown = false;
    service.updateProfile({ name: 'Bad' }).subscribe({ error: () => { errorThrown = true; } });

    const req = httpMock.expectOne((r) =>
      r.url.includes('/users/user-1') && r.method === 'PUT',
    );
    req.flush('Error', { status: 400, statusText: 'Bad Request' });

    tick();
    expect(service.hasError()).toBeTrue();
    expect(errorThrown).toBeTrue();
  }));

  it('should call change-password endpoint and clear saving on success', fakeAsync(() => {
    service.changePassword({
      currentPassword: 'OldPass1@',
      newPassword: 'NewPass1@',
      confirmPassword: 'NewPass1@',
    }).subscribe();

    const req = httpMock.expectOne((r) =>
      r.url.includes('/users/user-1/change-password') && r.method === 'POST',
    );
    req.flush({ message: PROFILE_MESSAGES.PASSWORD_CHANGED });

    tick();
    expect(service.saving()).toBeFalse();
    expect(service.hasError()).toBeFalse();
  }));

  it('should set error on failed changePassword', fakeAsync(() => {
    let errorThrown = false;
    service.changePassword({
      currentPassword: 'Wrong',
      newPassword: 'NewPass1@',
      confirmPassword: 'NewPass1@',
    }).subscribe({ error: () => { errorThrown = true; } });

    const req = httpMock.expectOne((r) =>
      r.url.includes('/users/user-1/change-password'),
    );
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    tick();
    expect(service.hasError()).toBeTrue();
    expect(errorThrown).toBeTrue();
  }));

  it('updateProfile should return error observable when currentUser is null', fakeAsync(() => {
    // Directly clear the user state — simulates the authorization guard failing
    (service as any).currentUser$.set(null);

    let errorThrown = false;
    service.updateProfile({ name: 'Fail' }).subscribe({ error: () => { errorThrown = true; } });
    tick();

    expect(errorThrown).toBeTrue();
    httpMock.expectNone((r) => r.url.includes('/users/') && r.method === 'PUT');
  }));

  it('changePassword should return error observable when currentUser is null', fakeAsync(() => {
    // Directly clear the user state — simulates the authorization guard failing
    (service as any).currentUser$.set(null);

    let errorThrown = false;
    service.changePassword({
      currentPassword: 'a',
      newPassword: 'b',
      confirmPassword: 'b',
    }).subscribe({ error: () => { errorThrown = true; } });
    tick();

    expect(errorThrown).toBeTrue();
    httpMock.expectNone((r) => r.url.includes('/change-password'));
  }));
});
