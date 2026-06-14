import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { selectIsAuthenticated, selectAuthUser } from '../../../auth/store/auth.selectors';
import { logout } from '../../../auth/store/auth.actions';
import { Router } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let store: MockStore;
  let router: Router;

  // ─── TEST-FE-001: Guest state ──────────────────────────────────────────────

  describe('guest state (TEST-FE-001)', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HeaderComponent, RouterTestingModule],
        providers: [
          provideMockStore({
            selectors: [
              { selector: selectIsAuthenticated, value: false },
              { selector: selectAuthUser, value: null },
            ],
          }),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(HeaderComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      router = TestBed.inject(Router);

      fixture.detectChanges();
    });

    it('should be defined', () => {
      expect(component).toBeDefined();
    });

    it('renders Sign in button when not authenticated', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const signInBtn = fixture.nativeElement.querySelector('[data-cy="sign-in-btn"]');
      expect(signInBtn).toBeTruthy();
      expect(signInBtn.textContent.trim()).toBe('Sign in');
    }));

    it('renders Register button when not authenticated', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const registerBtn = fixture.nativeElement.querySelector('[data-cy="register-btn"]');
      expect(registerBtn).toBeTruthy();
      expect(registerBtn.textContent.trim()).toBe('Register');
    }));

    it('does NOT render user menu when not authenticated', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const userMenu = fixture.nativeElement.querySelector('[data-cy="user-menu-trigger"]');
      expect(userMenu).toBeFalsy();
    }));

    it('navigates to /auth/login with returnUrl when Sign in clicked', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      spyOn(router, 'navigate');
      const signInBtn = fixture.nativeElement.querySelector('[data-cy="sign-in-btn"]');
      signInBtn.click();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(
        ['/auth/login'],
        { queryParams: { returnUrl: '/' } }
      );
    }));

    it('navigates to /auth/register with returnUrl when Register clicked', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      spyOn(router, 'navigate');
      const registerBtn = fixture.nativeElement.querySelector('[data-cy="register-btn"]');
      registerBtn.click();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(
        ['/auth/register'],
        { queryParams: { returnUrl: '/' } }
      );
    }));
  });

  // ─── TEST-FE-002: Authenticated state ─────────────────────────────────────

  describe('authenticated state (TEST-FE-002)', () => {
    const mockUser = { id: 'u1', username: 'testuser', role: 'user' };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HeaderComponent, RouterTestingModule],
        providers: [
          provideMockStore({
            selectors: [
              { selector: selectIsAuthenticated, value: true },
              { selector: selectAuthUser, value: mockUser },
            ],
          }),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(HeaderComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      router = TestBed.inject(Router);

      fixture.detectChanges();
    });

    it('renders username when authenticated', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const usernameEl = fixture.nativeElement.querySelector('[data-cy="username"]');
      expect(usernameEl).toBeTruthy();
      expect(usernameEl.textContent.trim()).toBe('testuser');
    }));

    it('does NOT render Sign in/Register when authenticated', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const signInBtn = fixture.nativeElement.querySelector('[data-cy="sign-in-btn"]');
      const registerBtn = fixture.nativeElement.querySelector('[data-cy="register-btn"]');
      expect(signInBtn).toBeFalsy();
      expect(registerBtn).toBeFalsy();
    }));

    it('dispatches logout action and navigates to / on logout click', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      spyOn(store, 'dispatch');
      spyOn(router, 'navigate');

      // Open the dropdown first
      const trigger = fixture.nativeElement.querySelector('[data-cy="user-menu-trigger"]');
      trigger.click();
      fixture.detectChanges();

      const logoutBtn = fixture.nativeElement.querySelector('[data-cy="logout-btn"]');
      expect(logoutBtn).toBeTruthy();
      logoutBtn.click();
      tick();

      expect(store.dispatch).toHaveBeenCalledWith(logout());
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));
  });
});
