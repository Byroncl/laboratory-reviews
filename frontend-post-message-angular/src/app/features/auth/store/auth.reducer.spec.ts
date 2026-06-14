import { authReducer } from './auth.reducer';
import * as AuthActions from './auth.actions';
import { AuthState } from '../models/auth.model';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  token: null,
};

describe('authReducer — loadAuthFromStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('clears localStorage and returns anonymous state when stored user has old {email,name} shape', () => {
    localStorage.setItem('auth_token', 'old-token');
    localStorage.setItem('auth_user', JSON.stringify({ id: '1', email: 'a@b.com', name: 'Alice' }));

    const state = authReducer(initialState, AuthActions.loadAuthFromStorage());

    expect(state.isAuthenticated).toBeFalse();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('hydrates state correctly when stored user has valid {username,role} shape', () => {
    const validUser = { id: 'u1', username: 'alice', role: 'user' };
    localStorage.setItem('auth_token', 'valid-token');
    localStorage.setItem('auth_user', JSON.stringify(validUser));

    const state = authReducer(initialState, AuthActions.loadAuthFromStorage());

    expect(state.isAuthenticated).toBeTrue();
    expect(state.user).toEqual(validUser);
    expect(state.token).toBe('valid-token');
  });
});
