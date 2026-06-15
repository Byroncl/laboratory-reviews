# Posts Module

A feature module for managing blog posts and comments, following clean architecture patterns.

## Structure

```
posts/
├── constants/        API endpoints, post statuses, pagination defaults, validation rules
├── types/            TypeScript types and discriminated unions (PostStatus, PostAction, etc.)
├── interfaces/       Data contracts (IPost, IComment, IPostFilters, IPagination, etc.)
├── utils/            Pure utility functions (filters, pagination helpers, entity ID extraction)
├── pipes/            Display pipes (PostStatusPipe for status formatting)
├── services/         Business logic and signal-based state management
├── components/       Reusable UI components
├── pages/            Page-level (routable) components
├── posts.routes.ts   Route configuration
└── index.ts          Root barrel file
```

## Importing

```typescript
// Recommended — root barrel
import { PostsListComponent, PostCardComponent, PostsService } from '@app/features/posts';

// Scoped barrel (when tree-shaking matters)
import { PostsListComponent } from '@app/features/posts/pages';
import { PostCardComponent } from '@app/features/posts/components';
import { PostsService } from '@app/features/posts/services';
```

## Services

### PostsBaseService\<T\>

Abstract generic base class. Handles CRUD operations, signal-based state, pagination, and error handling. Subclasses override `_buildLoadParams()` for filter composition.

### PostsService extends PostsBaseService\<IPost\>

Adds `publishPost()` and `archivePost()`. Composes filters via pure utility functions from `utils/`.

Exposed signals: `posts$`, `filteredPosts$`, `loading$`, `error$`, `pagination$`.

### CommentsService

Standalone service (not extending PostsBaseService). Operates independently or within a post context. Supports nested replies.

Exposed signals: `comments`, `isLoading`, `hasError`, `pagination$`, `filteredComments`.

## State

```typescript
// Filter posts
postsService.updateFilters({ searchTerm: 'Angular', status: 'published' });
postsService.clearFilters();

// Pagination
postsService.nextPage();
postsService.prevPage();
postsService.resetPagination();
```

## Routing

```
/posts            PostsListComponent   — list with filters and pagination
/posts/new        PostFormComponent    — create a post
/posts/:id        PostDetailComponent  — detail with comments
/posts/:id/edit   PostFormComponent    — edit a post
```

Register in app routes:

```typescript
{
  path: 'posts',
  loadChildren: () => import('@app/features/posts/posts.routes').then(m => m.postsRoutes),
}
```

## Architecture Decisions

- **Barrel files at every level**: each subdirectory exposes a single `index.ts`.
- **PostsBaseService\<T\>** is a generic abstract class — do not register it as a provider directly.
- **CommentsService** follows the `AuditLogService` pattern from the admin module: standalone, no shared base.
- **Filter utilities** in `utils/filter.util.ts` are pure functions — composable and unit-testable without Angular.
- **Modern control flow** (`@if`, `@for`) is used in all templates instead of `*ngIf`/`*ngFor`.
- **PostStatusType** (the union type) is distinct from `PostStatus` (the constants object) — use the type for annotations, the object for values.

## Testing

Pure utility functions can be tested without Angular:

```typescript
it('filters posts by search term', () => {
  const result = filterPostsBySearchTerm(posts, 'Angular');
  expect(result).toEqual([posts[0]]);
});
```

Services use Angular's testing utilities with signal inspection.
