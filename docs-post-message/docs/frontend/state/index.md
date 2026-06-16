---
title: State Management
sidebar_position: 1
description: NgRx auth store structure, actions, effects, selectors, and when to use the store vs. service-based state.
---

# State Management

The application uses a **minimal NgRx footprint**: the global store manages only authentication state. Every other piece of state lives in services backed by RxJS `BehaviorSubject`.

---

## NgRx Auth Store

### State Shape

```typescript
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
```

`AuthUser` holds the decoded JWT claims (id, email, display name, roles/permissions).

### Actions

**File:** `features/auth/store/auth.actions.ts`

| Action | Payload | Trigger |
|---|---|---|
| `login` | `{ email, password }` | Login form submit |
| `loginSuccess` | `{ token, user }` | Backend returns 200 |
| `loginFailure` | `{ error }` | Backend returns error |
| `register` | `{ email, password, name, ... }` | Register form submit |
| `registerSuccess` | `{ token, user }` | Backend returns 201 |
| `registerFailure` | `{ error }` | Backend returns error |
| `logout` | — | User clicks logout |
| `loadAuthFromStorage` | — | App initializer on startup |

### Reducer

**File:** `features/auth/store/auth.reducer.ts`

Key transitions:

- `login` / `register` → sets `loading: true`, clears `error`
- `loginSuccess` / `registerSuccess` → sets `user`, `token`, `loading: false`; token is written to `localStorage` key `auth_token`
- `loginFailure` / `registerFailure` → sets `error`, `loading: false`
- `logout` → resets entire state to initial; removes `auth_token` from `localStorage`
- `loadAuthFromStorage` → reads `auth_token` from `localStorage`, decodes it, populates `user` and `token` if valid

### Effects

**File:** `features/auth/store/auth.effects.ts`

```typescript
// Login flow
login$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.login),
    switchMap(({ email, password }) =>
      this.apiService.post<AuthResponse>('/auth/login', { email, password }).pipe(
        map(res => AuthActions.loginSuccess({ token: res.token, user: res.user })),
        catchError(err => of(AuthActions.loginFailure({ error: err.message })))
      )
    )
  )
);

// After loginSuccess: persist token and navigate
loginSuccess$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(({ token }) => localStorage.setItem('auth_token', token)),
    tap(() => this.router.navigate(['/dashboard']))
  ),
  { dispatch: false }
);
```

### Selectors

**File:** `features/auth/store/auth.selectors.ts`

```typescript
selectAuthState    // root auth slice
selectToken        // string | null
selectUser         // AuthUser | null
selectAuthLoading  // boolean
selectAuthError    // string | null
selectIsAuthenticated  // derived: !!token
```

---

## Token Persistence

The JWT is stored in and read from `localStorage` under the key `auth_token`.

| Event | Action |
|---|---|
| `loginSuccess` | `localStorage.setItem('auth_token', token)` |
| `logout` | `localStorage.removeItem('auth_token')` |
| App init | `dispatch(loadAuthFromStorage)` reads and validates the stored token |

`JwtInterceptor` reads directly from `localStorage` on every HTTP request — it does not subscribe to the NgRx store — which ensures the token is injected even before the store is hydrated.

---

## Service-Based State

All non-auth state uses `BehaviorSubject` inside services. This is the default pattern for:

- **WebSocket event streams** — `WebSocketService` exposes one `BehaviorSubject` per event type (e.g., `commentCreated$`, `userUpdated$`). Components subscribe and update their local view.
- **Paginated lists** — dashboard pages (users, roles, permissions) hold their list state inside the feature service, not the global store.
- **Notification state** — `NotificationsService` owns an unread count and notification list as `BehaviorSubject`.
- **UI state** — modals, filters, selected items are local component state or injected into the immediate parent.

```typescript
// Example: dashboard users page
@Injectable({ providedIn: 'root' })
export class UsersAdminService extends AdminBaseService {
  private users$ = new BehaviorSubject<User[]>([]);

  getUsers(): Observable<User[]> {
    return this.users$.asObservable();
  }

  loadUsers(): void {
    this.apiService.get<User[]>('/users').subscribe(users => this.users$.next(users));
  }
}
```

---

## Decision Guide: Store vs. Service

| Criterion | Use NgRx Store | Use Service + BehaviorSubject |
|---|---|---|
| Needed by multiple unrelated features | Yes | No |
| Needs time-travel debugging | Yes | No |
| Scope is one feature or one page | No | Yes |
| State is derived from WebSocket events | No | Yes |
| Requires complex side effects across features | Yes | No |

The rule of thumb: **NgRx for global auth state; services for everything else.** Adding more slices to the store increases boilerplate and cognitive overhead without meaningful benefit for a feature-scoped state that no other feature reads.
