# Client Module Usage Examples

Guía práctica para usar los patrones escalables del módulo client refactorizado.

## 1. Importar desde el módulo

Gracias a los barrel exports, las importaciones son limpias:

```typescript
// ✅ LIMPIO - Desde el barrel export
import { 
  PostDto, 
  CommentDto,
  CLIENT_ENDPOINTS, 
  CLIENT_MESSAGES,
  postTitleValidator,
  truncateText
} from '@features/client';

// ❌ VERBOSE - Sin barrel exports
import { PostDto } from '@features/client/types/client.dtos';
import { CLIENT_ENDPOINTS } from '@features/client/constants/client-api.constants';
import { postTitleValidator } from '@features/client/utils/form.validators';
```

## 2. Usar servicios con tipos

```typescript
import { Component, inject } from '@angular/core';
import { ClientPostsService, PostDto, ApiResponse } from '@features/client';

@Component({ ... })
export class PostListComponent {
  private postsService = inject(ClientPostsService);

  // ✅ TYPED: Servicio devuelve ApiResponse<PostDto>
  loadPosts() {
    this.postsService.getMyPosts(1, 10).subscribe({
      next: (response: ApiResponse<PostDto>) => {
        // response.data contiene los posts
        // IntelliSense sabe qué propiedades tiene PostDto
      }
    });
  }
}
```

## 3. Validadores reutilizables

```typescript
import { FormBuilder } from '@angular/forms';
import { 
  postTitleValidator, 
  postBodyValidator,
  passwordValidator,
  passwordMatchValidator
} from '@features/client';

const fb = inject(FormBuilder);

// ✅ Reutiliza validadores del módulo
const postForm = fb.group({
  title: ['', [Validators.required, postTitleValidator()]],
  body: ['', [Validators.required, postBodyValidator()]],
  categoryId: ['']
});

const passwordForm = fb.group(
  {
    current: ['', [Validators.required, passwordValidator()]],
    new: ['', [Validators.required, passwordValidator()]],
    confirm: ['', [Validators.required]]
  },
  { validators: passwordMatchValidator('new', 'confirm') }
);
```

## 4. Utilidades de string

```typescript
import { truncateText, highlightText } from '@features/client';

// Truncar contenido largo
const preview = truncateText(post.body, 150); // "Lorem ipsum dolor sit amet..."

// Destacar término de búsqueda
const highlighted = highlightText(post.body, 'lorem'); // "Lorem ipsum..." con <mark>
```

## 5. Utilidades de paginación

```typescript
import { 
  calculateTotalPages, 
  canGoToNextPage, 
  canGoToPreviousPage 
} from '@features/client';

const currentPage = signal(1);
const totalItems = signal(45);
const pageSize = signal(10);

const totalPages = computed(() => 
  calculateTotalPages(totalItems(), pageSize())
);

const canNext = computed(() => 
  canGoToNextPage(currentPage(), totalPages())
);

const canPrev = computed(() => 
  canGoToPreviousPage(currentPage())
);
```

## 6. Componentes con inputs/outputs modernos

```typescript
import { PostCardComponent, PostDto } from '@features/client';

@Component({
  template: `
    <app-post-card
      [post]="selectedPost()"
      [showEditDelete]="isAuthor()"
      (edit)="onEditPost($event)"
      (delete)="onDeletePost($event)"
    ></app-post-card>
  `
})
export class PostDetailComponent {
  selectedPost = signal<PostDto | null>(null);
  isAuthor = signal(false);

  onEditPost(postId: string) { ... }
  onDeletePost(postId: string) { ... }
}
```

## 7. Mensajes con i18n

```typescript
import { CLIENT_MESSAGES } from '@features/client';

// En componente
readonly messages = CLIENT_MESSAGES.MY_POSTS;

// En template
<h2>{{ messages.TITLE | translate }}</h2>
<button>{{ messages.CREATE_BUTTON | translate }}</button>
<p *ngIf="!posts()">{{ messages.EMPTY | translate }}</p>

// Mensajes disponibles
CLIENT_MESSAGES.MY_POSTS.TITLE
CLIENT_MESSAGES.MY_POSTS.EMPTY
CLIENT_MESSAGES.MY_POSTS.CREATE_BUTTON
CLIENT_MESSAGES.MY_POSTS.CANCEL_BUTTON
CLIENT_MESSAGES.MY_POSTS.LOADING
CLIENT_MESSAGES.MY_POSTS.PAGINATION_PREVIOUS
CLIENT_MESSAGES.MY_POSTS.PAGINATION_NEXT

// Y similarmente para:
// - CLIENT_MESSAGES.MY_COMMENTS
// - CLIENT_MESSAGES.MY_FAVORITES
// - CLIENT_MESSAGES.PROFILE
// - CLIENT_MESSAGES.POST_FORM
```

## 8. Validación con constantes

```typescript
import { CLIENT_VALIDATION, CLIENT_MESSAGES } from '@features/client';

// Validaciones compartidas
const minTitleLength = CLIENT_VALIDATION.POST.TITLE_MIN_LENGTH; // 3
const minBodyLength = CLIENT_VALIDATION.POST.BODY_MIN_LENGTH;   // 10
const minPassword = CLIENT_VALIDATION.PASSWORD.MIN_LENGTH;      // 8

// Mensajes de validación
const messages = CLIENT_MESSAGES;
```

## 9. Dialogs de confirmación

```typescript
import { confirmDeleteDialog, confirmDialog } from '@features/client';

async deletePost(postId: string) {
  const confirmed = await confirmDeleteDialog('post');
  if (confirmed) {
    this.postsService.deletePost(postId).subscribe(...);
  }
}
```

## 10. Extender el módulo con nuevas funciones

```typescript
// Ejemplo: Agregar un nuevo validador para tags

// 1. Agregar a utils/form.validators.ts
export function tagsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const tags = control.value.split(',');
    return tags.length <= 5 ? null : { tooManyTags: true };
  };
}

// 2. Exportar desde utils/index.ts
export * from './form.validators'; // Ya lo hace

// 3. Usarlo en un formulario
const form = fb.group({
  tags: ['', [tagsValidator()]]
});

// 4. La importación sigue siendo limpia
import { tagsValidator } from '@features/client';
```

## Patrón: Agregar nuevo servicio

```typescript
// 1. Crear archivo: services/client-searches.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CLIENT_ENDPOINTS } from '../constants';

@Injectable({ providedIn: 'root' })
export class ClientSearchesService {
  constructor(private http: HttpClient) {}

  search(query: string) {
    return this.http.get('/api/posts/search', { params: { q: query } });
  }
}

// 2. Exportar desde services/index.ts
export * from './client-searches.service';

// 3. Usar en componente
import { ClientSearchesService } from '@features/client';

this.searchService.search('javascript').subscribe(...);
```

## Checklist de refactorización

- ✅ Constants: URLs, mensajes, reglas de validación centralizadas
- ✅ Types: DTOs e interfaces tipadas
- ✅ Utils: Funciones puras reutilizables (validadores, paginación, strings)
- ✅ Services: Tipados, con error handling, retry logic
- ✅ Pages: Signals, computed properties, @if/@for, takeUntilDestroyed()
- ✅ Components: Inputs/outputs modernos, separación HTML/CSS
- ✅ i18n: Todas las strings en JSON traducidas
- ✅ Barrel exports: Importaciones limpias desde @features/client

## Próximos pasos

1. Aplicar el mismo patrón a otros módulos (dashboard, notifications, etc.)
2. Crear pipes reutilizables (formatDate, formatPrice, etc.)
3. Agregar directives reutilivas (focus-on-init, debounce-click, etc.)
4. Crear composables para patrones comunes (useForm, usePagination, etc.)

## Recursos

- `/frontend-post-message-angular/src/app/features/client/constants/` — All constants
- `/frontend-post-message-angular/src/app/features/client/types/` — All types and DTOs
- `/frontend-post-message-angular/src/app/features/client/utils/` — All utilities
- `/frontend-post-message-angular/src/app/features/client/services/` — All services
- `/frontend-post-message-angular/src/app/features/auth/` — Reference implementation

---

## Resumen

El módulo client refactorizado sigue el patrón clean architecture con:
- **Escalabilidad**: Nuevas features se agregan sin modificar código existente
- **Reusabilidad**: Validadores, utilities, tipos reutilizables en toda la app
- **Mantenibilidad**: Cambios en constantes afectan toda la app automáticamente
- **Type Safety**: DTOs e interfaces tipadas en todas partes
- **Modern Angular**: Signals, @if/@for, takeUntilDestroyed(), inputs/outputs
- **i18n**: Todos los mensajes traducidos a es/en

🎯 **Resultado**: Código más limpio, mantenible y escalable.
