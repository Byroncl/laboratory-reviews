# Dashboard Module Usage Examples

Guía práctica para usar los patrones del módulo dashboard refactorizado.

---

## 1. Importar desde el módulo

Import everything from the barrel — never import from deep paths:

```typescript
import {
  User, Post, Role, Permission, AuditLog,
  DASHBOARD_ENDPOINTS, DASHBOARD_MESSAGES, DASHBOARD_CONFIG,
  UsersService, PostsService, RolesService,
  filterUsersBySearch, sortByField, calculateTotalPages
} from '@features/dashboard';
```

> **Common mistake:** importing directly from a service file (`@features/dashboard/services/users.service`)
> bypasses the barrel and breaks encapsulation. Always import from `@features/dashboard`.

---

## 2. Use services with typed responses

```typescript
import { Component, inject } from '@angular/core';
import { UsersService, User } from '@features/dashboard';

@Component({ selector: 'app-user-detail', template: '' })
export class UserDetailComponent {
  private usersService = inject(UsersService);

  loadUser(userId: string): void {
    this.usersService.getUserById(userId).subscribe({
      next: (response) => {
        const user: User = response.data;
        console.log(user.email); // TypeScript knows the full User interface
      },
      error: (err) => console.error('Failed to load user', err),
    });
  }
}
```

---

## 3. Filter utilities

```typescript
import { filterUsersBySearch, filterUsersByStatus, User } from '@features/dashboard';

const allUsers: User[] = [ /* ... */ ];

const activeUsers = filterUsersByStatus(allUsers, 'active');
const results     = filterUsersBySearch(activeUsers, 'john');
```

Utilities are pure functions — they are easy to unit-test and do not depend on Angular.

---

## 4. Sort utilities

```typescript
import { sortByField, User } from '@features/dashboard';

const sorted    = sortByField(allUsers, 'name', 'asc');
const reversed  = sortByField(allUsers, 'name', 'desc');
```

---

## 5. Pagination with signals

```typescript
import { Component, signal, computed } from '@angular/core';
import { calculateTotalPages, canGoToNextPage } from '@features/dashboard';

@Component({ selector: 'app-paginated-list', template: '' })
export class PaginatedListComponent {
  readonly currentPage = signal(1);
  readonly pageSize    = signal(10);
  readonly total       = signal(0);

  readonly totalPages = computed(() =>
    calculateTotalPages(this.total(), this.pageSize())
  );

  readonly canGoNext = computed(() =>
    canGoToNextPage(this.currentPage(), this.totalPages())
  );

  nextPage(): void {
    if (this.canGoNext()) {
      this.currentPage.update(p => p + 1);
    }
  }
}
```

---

## 6. i18n messages via constants

Use `DASHBOARD_MESSAGES` keys everywhere — never hardcode strings:

```typescript
import { DASHBOARD_MESSAGES } from '@features/dashboard';

// In a component class
const messages = DASHBOARD_MESSAGES.USERS;
this.successMessage = messages.DELETED;

// In a template
// <h2>{{ messages.TITLE | translate }}</h2>
// <button>{{ messages.CREATE_BUTTON | translate }}</button>
```

> **Why:** switching languages or copy later requires changing one constant, not hunting
> through every template.

---

## 7. Configuration constants

```typescript
import { DASHBOARD_CONFIG } from '@features/dashboard';

const defaultPageSize = DASHBOARD_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE; // 10
const statusOptions   = DASHBOARD_CONFIG.USER_STATUSES;   // string[]
const auditActions    = DASHBOARD_CONFIG.AUDIT_ACTIONS;   // string[]
```

Use `DASHBOARD_CONFIG` for any value that might change per environment or business rule.
Never scatter magic numbers across components.

---

## 8. Full component example — user search

A complete, idiomatic Angular component using signals, computed state, and the barrel export:

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  UsersService,
  User,
  filterUsersBySearch,
  DASHBOARD_MESSAGES,
} from '@features/dashboard';

@Component({
  selector: 'app-user-search',
  standalone: true,
  template: `
    <input
      (input)="search.set($any($event.target).value)"
      [placeholder]="messages.SEARCH_PLACEHOLDER | translate"
    />

    @for (user of filteredUsers(); track user._id) {
      <div>{{ user.name }} ({{ user.email }})</div>
    } @empty {
      <p>{{ messages.EMPTY_STATE | translate }}</p>
    }
  `,
})
export class UserSearchComponent {
  private usersService = inject(UsersService);

  readonly messages = DASHBOARD_MESSAGES.USERS;

  readonly search = signal('');
  readonly users  = signal<User[]>([]);

  readonly filteredUsers = computed(() =>
    filterUsersBySearch(this.users(), this.search())
  );

  constructor() {
    this.usersService
      .getAllUsers()
      .pipe(takeUntilDestroyed())
      .subscribe(response => this.users.set(response.data ?? []));
  }
}
```

> **Note on `takeUntilDestroyed()`:** always unsubscribe in standalone components.
> Calling it inside the constructor (or an injection context) is the correct pattern in Angular 17+.

---

## Best-practices checklist

- Use `DASHBOARD_ENDPOINTS` for all API URLs — no inline strings
- Type every response with `User`, `Post`, `Role`, etc.
- Use utility functions for filter, sort, and pagination logic (they are testable in isolation)
- Use typed services — `UsersService`, `PostsService`, etc.
- Manage state with `signal()` and derive views with `computed()`
- Use `DASHBOARD_MESSAGES` keys for all UI text
- Use `DASHBOARD_CONFIG` for configurable values and limits
- Call `takeUntilDestroyed()` for RxJS subscriptions in components
- Always import from the barrel: `@features/dashboard`

---

## Next steps

1. Apply the same barrel + constants + utils pattern to other feature modules
2. Create reusable pipes for the dashboard (date formatting, currency, status labels)
3. Create permission-based visibility directives using `Role` and `Permission` types
4. Add unit tests for all utility functions (`filter.utils`, `sort.utils`, `pagination.utils`)
