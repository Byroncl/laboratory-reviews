# Ejemplos de Uso - Sistema de Minimización de Modales

## Ejemplo 1: Modal de Confirmación Básica

```typescript
// En posts.component.ts
import { Component } from '@angular/core';
import { ModalService } from '@shared/services/modal.service';

@Component({
  selector: 'app-posts',
  template: `
    <button (click)="deletePost(postId)">Eliminar Post</button>
  `
})
export class PostsComponent {
  constructor(private modalService: ModalService) {}

  deletePost(postId: string): void {
    this.modalService.openConfirm(
      'Eliminar Post',
      '¿Estás seguro de que deseas eliminar este post?',
      true // isDangerous = botón rojo
    ).subscribe(result => {
      if (result.confirmed) {
        console.log('Post eliminado:', postId);
        // Llamar al servicio para eliminar
      }
    });
  }
}
```

**Comportamiento**:
1. Usuario hace click → Se abre modal
2. Botón ▼ (minimizar) disponible en header
3. Click en ▼ → Modal desaparece, aparece en bandeja
4. Click en bandeja → Modal restaurado

---

## Ejemplo 2: Modal de Formulario con Datos

```typescript
// En users.component.ts
import { Component } from '@angular/core';
import { ModalService } from '@shared/services/modal.service';
import { UserService } from './user.service';

@Component({
  selector: 'app-users',
  template: `
    <button (click)="editUser(userId)">Editar Usuario</button>
  `
})
export class UsersComponent {
  constructor(
    private modalService: ModalService,
    private userService: UserService
  ) {}

  editUser(userId: string): void {
    this.modalService.openForm(
      'Editar Usuario',
      'Guardar',
      { userId } // Datos que la directiva puede acceder
    ).subscribe(result => {
      if (result.confirmed && result.data) {
        this.userService.update(userId, result.data).subscribe(() => {
          console.log('Usuario actualizado');
        });
      }
    });
  }
}
```

---

## Ejemplo 3: Componente Modal Custom Minimizable

Si necesitas un modal completamente personalizado:

```typescript
// user-form-modal.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MinimizableModalDirective } from '@shared/directives';
import { MinimizedModalService } from '@shared/services/minimized-modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MinimizableModalDirective],
  template: `
    <div 
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center transition-opacity duration-300"
      [class.opacity-0]="isMinimized"
      [class.pointer-events-none]="isMinimized"
      appMinimizable
      [isMinimized]="isMinimized"
      (minimized)="onMinimize($event)"
      (restored)="onRestore($event)"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <div class="flex gap-1">
            <button 
              type="button"
              (click)="toggleMinimize()"
              class="p-1 hover:bg-gray-100 rounded transition"
              [attr.aria-label]="isMinimized ? 'Expand' : 'Minimize'"
            >
              {{ isMinimized ? '▲' : '▼' }}
            </button>
            <button 
              type="button"
              (click)="onCancel()"
              class="p-1 hover:bg-gray-100 rounded transition"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Body (hidden when minimized) -->
        @if (!isMinimized) {
          <form [formGroup]="form" class="px-6 py-4">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Nombre</label>
                <input 
                  type="text" 
                  formControlName="name"
                  class="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  formControlName="email"
                  class="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </form>

          <!-- Footer -->
          <div class="flex gap-3 justify-end px-6 py-4 border-t">
            <button 
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button 
              type="button"
              (click)="onConfirm()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Guardar
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host.minimizable-minimized {
      display: none !important;
    }
  `]
})
export class UserFormModalComponent implements OnInit, OnDestroy {
  @Input() id: string = '';
  @Input() title: string = 'Editar Usuario';

  form!: FormGroup;
  isMinimized = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private minimizedModalService: MinimizedModalService
  ) {
    this.form = this.fb.group({
      name: [''],
      email: ['']
    });
  }

  ngOnInit(): void {
    // Escuchar restauración desde la bandeja
    this.minimizedModalService.restoreRequest
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event.id === this.id) {
          this.isMinimized = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMinimize(): void {
    if (this.isMinimized) {
      this.onRestore();
    } else {
      this.onMinimize();
    }
  }

  onMinimize(): void {
    this.isMinimized = true;
    this.minimizedModalService.addMinimized({
      id: this.id,
      title: this.title
    });
  }

  onRestore(): void {
    this.isMinimized = false;
    this.minimizedModalService.removeMinimized(this.id);
  }

  onConfirm(): void {
    console.log('Formulario enviado:', this.form.value);
    this.onCancel();
  }

  onCancel(): void {
    console.log('Modal cerrado');
    // Emitir evento o redirigir
  }
}
```

---

## Ejemplo 4: Múltiples Modales Minimizados

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { ModalService } from '@shared/services/modal.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="space-y-4 p-4">
      <button (click)="openModal1()">Abrir Modal 1</button>
      <button (click)="openModal2()">Abrir Modal 2</button>
      <button (click)="openModal3()">Abrir Modal 3</button>
    </div>

    <!-- Componentes de modales -->
    <app-advanced-modal></app-advanced-modal>
    <app-minimized-modals-tray></app-minimized-modals-tray>
  `
})
export class AppComponent {
  constructor(private modalService: ModalService) {}

  openModal1(): void {
    this.modalService.openConfirm(
      'Modal 1',
      'Este es el primer modal'
    ).subscribe(result => {
      console.log('Modal 1 resultado:', result.confirmed);
    });
  }

  openModal2(): void {
    this.modalService.openConfirm(
      'Modal 2',
      'Este es el segundo modal'
    ).subscribe(result => {
      console.log('Modal 2 resultado:', result.confirmed);
    });
  }

  openModal3(): void {
    this.modalService.openConfirm(
      'Modal 3',
      'Este es el tercer modal'
    ).subscribe(result => {
      console.log('Modal 3 resultado:', result.confirmed);
    });
  }
}
```

**Flujo esperado**:
1. Abre Modal 1 → se muestra en pantalla
2. Click ▼ → Modal 1 se minimiza, aparece [Modal 1 ↑] en bandeja
3. Abre Modal 2 → se muestra Modal 2 en pantalla
4. Click ▼ → Modal 2 se minimiza, bandeja muestra [Modal 1 ↑] [Modal 2 ↑]
5. Click [Modal 1 ↑] → Modal 1 restaurado, Modal 2 se cierra
6. ...y así sucesivamente

---

## Ejemplo 5: Integración con Servicio HTTP

```typescript
// posts.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from '@shared/services/modal.service';
import { PostService } from './post.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-posts',
  template: `
    <div class="space-y-4">
      @for (post of posts; track post.id) {
        <div class="border p-4 rounded">
          <h3>{{ post.title }}</h3>
          <p>{{ post.content }}</p>
          <button (click)="deletePost(post.id)">Eliminar</button>
        </div>
      }
    </div>

    <app-advanced-modal></app-advanced-modal>
    <app-minimized-modals-tray></app-minimized-modals-tray>
  `
})
export class PostsComponent implements OnInit, OnDestroy {
  posts: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private postService: PostService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPosts(): void {
    this.postService.getPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(posts => {
        this.posts = posts;
      });
  }

  deletePost(postId: string): void {
    // Usuario puede minimizar el modal mientras decide
    this.modalService.openConfirm(
      'Eliminar Post',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      true
    ).pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.confirmed) {
          this.postService.deletePost(postId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.posts = this.posts.filter(p => p.id !== postId);
            });
        }
      });
  }
}
```

---

## Ejemplo 6: Modal con Template Personalizado

```typescript
// comments.component.ts
import { Component, Template, ViewChild } from '@angular/core';
import { ModalService } from '@shared/services/modal.service';

@Component({
  selector: 'app-comments',
  template: `
    <ng-template #commentTemplate>
      <div class="space-y-4">
        <textarea 
          [(ngModel)]="commentText"
          placeholder="Escribe un comentario..."
          class="w-full px-3 py-2 border rounded-lg"
        ></textarea>
        <div class="text-sm text-gray-500">
          {{ commentText.length }} caracteres
        </div>
      </div>
    </ng-template>

    <button (click)="openCommentModal()">Nuevo Comentario</button>

    <app-advanced-modal></app-advanced-modal>
    <app-minimized-modals-tray></app-minimized-modals-tray>
  `
})
export class CommentsComponent {
  @ViewChild('commentTemplate') commentTemplate: any;
  commentText = '';

  constructor(private modalService: ModalService) {}

  openCommentModal(): void {
    this.modalService.openForm('Nuevo Comentario', 'Comentar').subscribe(result => {
      if (result.confirmed) {
        console.log('Comentario:', this.commentText);
        this.commentText = '';
      }
    });
  }
}
```

---

## Ejemplo 7: Casos de Error y Validación

```typescript
// safe-deletion.component.ts
import { Component, OnDestroy } from '@angular/core';
import { ModalService } from '@shared/services/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-safe-deletion',
  template: `
    <button (click)="deleteWithValidation()">Eliminar con Validación</button>

    <app-advanced-modal></app-advanced-modal>
    <app-minimized-modals-tray></app-minimized-modals-tray>
  `
})
export class SafeDeletionComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private modalService: ModalService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  deleteWithValidation(): void {
    // Modal puede minimizarse mientras el usuario navega
    this.modalService.openConfirm(
      'Eliminar Artículo',
      'Esto eliminará permanentemente el artículo y todos sus comentarios.',
      true
    ).pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.confirmed) {
          this.performDeletion();
        }
      });
  }

  private performDeletion(): void {
    console.log('Eliminando artículo...');
  }
}
```

---

## Tips y Mejores Prácticas

### ✅ DO's

```typescript
// Usar takeUntil para limpiar subscriptions
this.modalService.openConfirm(...).pipe(takeUntil(this.destroy$)).subscribe(...);

// Tipificar bien los eventos
onMinimize(event: { id: string; title: string }): void { }

// Emitir eventos claros
minimized = new EventEmitter<{ id: string; title: string }>();
restored = new EventEmitter<string>();

// Resetear estado cuando se cierra
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### ❌ DON'Ts

```typescript
// NO usar tipos any
(event: any) => { } // ✗

// NO olvidar takeUntil
this.modalService.openConfirm(...).subscribe(...); // ✗

// NO manipular el DOM directamente
document.getElementById('modal')?.style.display = 'none'; // ✗

// NO dejar subscriptions activas
// siempre limpiar en ngOnDestroy
```

---

## Testing

```typescript
describe('PostsComponent', () => {
  it('should minimize modal when user clicks minimize button', () => {
    const component = new PostsComponent(modalService);
    component.deletePost('123');

    // Modal abierto
    expect(modalService.getCurrentModal()).toBeTruthy();

    // Usuario click minimize
    component.toggleMinimize();

    // Modal minimizado
    expect(minimizedModalService.isMinimized('modal-id')).toBe(true);
  });

  it('should restore modal when clicking tray button', (done) => {
    const component = new PostsComponent(modalService);
    component.deletePost('123');
    component.toggleMinimize();

    // Click tray button
    minimizedModalService.restoreMinimized('modal-id').subscribe(() => {
      expect(component.isMinimized).toBe(false);
      done();
    });
  });
});
```
