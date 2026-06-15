import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError, Subject } from 'rxjs';
import { AuthEffects } from './auth.effects';
import { AuthService } from '../services/auth.service';
import * as AuthActions from './auth.actions';
import { Router } from '@angular/router';
import { Action } from '@ngrx/store';

function buildJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('AuthEffects', () => {
  let actions$: Subject<Action>;
  let effects: AuthEffects;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    authService = jasmine.createSpyObj('AuthService', ['login']);
    router = jasmine.createSpyObj('Router', ['navigate'], { url: '/auth/login' });

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$.asObservable()),
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });

    effects = TestBed.inject(AuthEffects);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login$', () => {
    it('dispatches loginSuccess with decoded AuthUser when token is valid', fakeAsync(() => {
      const token = buildJwt({ sub: 'u1', username: 'alice', type: 'admin' });
      const mockUser = { id: 'u1', username: 'alice', email: 'alice@test.com', role: 'admin' };
      authService.login.and.returnValue(of({ access_token: token, user: mockUser }));

      const results: Action[] = [];
      effects.login$.subscribe(action => results.push(action));

      actions$.next(AuthActions.login({ username: 'alice', password: 'pw' }));
      tick();

      expect(results.length).toBe(1);
      expect(results[0]).toEqual(
        AuthActions.loginSuccess({
          user: { id: 'u1', username: 'alice', role: 'admin' },
          token,
        })
      );
    }));

    it('dispatches loginFailure when token is malformed', fakeAsync(() => {
      const mockUser = { id: '', username: '', email: '', role: '' };
      authService.login.and.returnValue(of({ access_token: 'bad.token', user: mockUser }));

      const results: Action[] = [];
      effects.login$.subscribe(action => results.push(action));

      actions$.next(AuthActions.login({ username: 'alice', password: 'pw' }));
      tick();

      expect(results.length).toBe(1);
      expect(results[0]).toEqual(AuthActions.loginFailure({ error: 'Invalid token' }));
    }));

    it('dispatches loginFailure when HTTP call errors', fakeAsync(() => {
      authService.login.and.returnValue(throwError(() => ({ error: { message: 'Unauthorized' } })));

      const results: Action[] = [];
      effects.login$.subscribe(action => results.push(action));

      actions$.next(AuthActions.login({ username: 'alice', password: 'bad' }));
      tick();

      expect(results.length).toBe(1);
      expect(results[0]).toEqual(AuthActions.loginFailure({ error: 'Unauthorized' }));
    }));
  });

  describe('loginSuccess$', () => {
    it('navigates to /dashboard when no returnUrl is in window.location.search', fakeAsync(() => {
      // window.location.search is '' in test environment (no query params)
      effects.loginSuccess$.subscribe();
      actions$.next(
        AuthActions.loginSuccess({ user: { id: 'u1', username: 'alice', role: 'user' }, token: 'tok' })
      );
      tick();

      // Effect reads URLSearchParams(window.location.search) — in test env no returnUrl → /dashboard
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));
  });
});
