# Profile Module

A feature module for managing the authenticated user's profile, following the same clean architecture patterns as the Posts module.

## Structure

```
profile/
├── constants/        API endpoints, form field names, validation rules, messages
├── types/            TypeScript types and discriminated unions (ProfileAction, etc.)
├── interfaces/       Data contracts (IUserProfile, IProfileUpdate, IChangePasswordDto, etc.)
├── utils/            Pure utility functions (user-id extraction, validators, form builders)
├── pipes/            Display pipes (UserBadgePipe for formatted user display)
├── services/         Signal-based state management (ProfileBaseService, ProfileService)
├── pages/            Page-level (routable) component
├── profile.routes.ts Route configuration
└── index.ts          Root barrel file
```

## Importing

```typescript
// Recommended — root barrel
import { ProfileComponent, ProfileService, UserBadgePipe } from '@app/features/profile';

// Scoped barrel (when tree-shaking matters)
import { ProfileComponent } from '@app/features/profile/pages';
import { ProfileService } from '@app/features/profile/services';
import { buildProfileForm } from '@app/features/profile/utils';
```

## Services

### ProfileBaseService\<T\>

Abstract generic base class. Provides signal-based state management (`currentUser$`, `loading$`, `saving$`, `error$`) and computed read-only aliases (`isLoading`, `isSaving`, `hasError`). Also provides centralised `_handleError` and `_getId` utilities. Does NOT make HTTP calls itself.

### ProfileService extends ProfileBaseService\<IUserProfile\>

Handles all profile HTTP operations using `ApiService`. Exposes public computed aliases (`currentUser`, `loading`, `saving`, `error`, `isOwnProfile`). Maintains NgRx Store integration to resolve the authenticated user.

Methods:
- `loadUserProfile(userId?: string)` — loads the authenticated user's profile
- `updateProfile(dto: IProfileUpdate)` — updates profile fields
- `changePassword(dto: IChangePasswordDto)` — changes the user's password

## State

```typescript
// Read state via signals
const user = profileService.currentUser();
const isLoading = profileService.loading();
const isSaving = profileService.saving();
const error = profileService.error();
const isOwn = profileService.isOwnProfile();

// Load / update
profileService.loadUserProfile().subscribe(...);
profileService.updateProfile({ name: 'Jane' }).subscribe(...);
profileService.changePassword({ currentPassword, newPassword, confirmPassword }).subscribe(...);
```

## Utils

### user-id.util.ts

Pure functions for extracting and validating user IDs.

```typescript
getUserId(user);          // returns _id ?? id ?? null
isValidUserId(id);        // guards against null/empty
isOwnProfile(user, authId);
```

### validation.util.ts

Angular `ValidatorFn` and cross-field `AbstractControl → ValidationErrors | null` validators.

```typescript
validatePasswordStrength  // Checks uppercase + lowercase + digit + special char
validatePasswordMatch     // Cross-field: newPassword === confirmPassword
validateEmail             // Regex-based email validator
validatePhone             // Regex-based phone validator
```

### form.util.ts

Factory functions to build typed `FormGroup` instances with validators pre-applied.

```typescript
buildProfileForm(fb, user?)  // Returns profile edit FormGroup
buildPasswordForm(fb)        // Returns change-password FormGroup
```

## Pipes

### UserBadgePipe

Formats a user for display: `"Name Lastname (role)"`.

```html
{{ profileService.currentUser() | userBadge }}
<!-- Outputs: John Doe (Admin) -->
```

## Routing

```
/profile   ProfileComponent   — view and edit the authenticated user's profile
```

Register in app routes:

```typescript
{
  path: 'profile',
  loadChildren: () =>
    import('@app/features/profile/profile.routes').then(m => m.profileRoutes),
}
```

## Architecture Decisions

- **Barrel files at every level**: each subdirectory exposes a single `index.ts`.
- **ProfileBaseService\<T\>** is a generic abstract class — do not register it as a provider directly.
- **Signal aliases**: `ProfileService` exposes `currentUser`, `loading`, `saving`, `error` as computed properties on top of the base signals, following the `PostsService` pattern.
- **NgRx Store integration** is kept in `ProfileService` (not the base) because it is specific to the authentication domain.
- **Form builders** are pure factory functions in `utils/form.util.ts`, making them independently testable without Angular's TestBed.
- **Constants replace all magic strings**: endpoints, messages, field names, and validation limits are all in `constants/`.

## Testing

Pure utility functions can be tested without Angular:

```typescript
it('returns the user _id', () => {
  expect(getUserId({ _id: 'abc', name: '', lastname: '', email: '', username: '' })).toBe('abc');
});
```

Services use Angular's `TestBed` with `HttpClientTestingModule` and `provideMockStore`.
