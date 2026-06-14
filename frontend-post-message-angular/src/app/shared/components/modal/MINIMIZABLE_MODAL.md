# Sistema de Minimización de Modales Reutilizable

## Descripción General

El sistema permite que **cualquier componente modal** se minimice a una bandeja en la parte inferior de la pantalla. Cuando un modal se minimiza:

1. **Desaparece** del viewport (fade out suave)
2. **Se agrega** a la bandeja inferior con su título
3. Click en la bandeja → **restaura** el modal
4. El estado se mantiene limpio y sin memory leaks

## Arquitectura

### Componentes Clave

```
┌─────────────────────────────────────────────┐
│         AdvancedModalComponent              │
│  (o cualquier otro modal)                   │
│                                             │
│  @Directive() appMinimizable                │
│  - Maneja minimizar/restaurar               │
│  - Emite eventos                            │
└─────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────┐
│      MinimizedModalService                  │
│  - Gestiona lista de minimizados            │
│  - Emite eventos de restauración            │
│  - Almacena estado del modal                │
└─────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────┐
│    MinimizedModalsTrayComponent             │
│  - Muestra bandeja inferior                 │
│  - Click → restaura modal                   │
│  - Animación suave                          │
└─────────────────────────────────────────────┘
```

## Implementación en Components

### 1. Usar con AdvancedModalComponent (ya implementado)

```typescript
// En cualquier componente que lo use
export class MyComponent {
  constructor(private modalService: ModalService) {}

  openModal(): void {
    this.modalService.openConfirm(
      'Titulo del Modal',
      'Mensaje del modal'
    ).subscribe(result => {
      if (result.confirmed) {
        // Usuario confirmó
      }
    });
  }
}
```

El modal automáticamente:
- Tendrá el botón ▼ (minimizar) en la esquina superior derecha
- Al hacer click, se minimizará
- Aparecerá en la bandeja inferior
- Click en la bandeja restaura el modal

### 2. Usar Directiva en Componentes Modales Personalizados

Si tienes un componente modal custom, puedes hacerlo minimizable:

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MinimizableModalDirective } from '@shared/directives';

@Component({
  selector: 'app-custom-modal',
  standalone: true,
  imports: [CommonModule, MinimizableModalDirective],
  template: `
    <div 
      class="modal-container"
      appMinimizable
      [isMinimized]="isMinimized"
      (minimized)="onMinimize($event)"
      (restored)="onRestore($event)"
    >
      <!-- Tu contenido del modal -->
      <header>
        <h1>{{ title }}</h1>
        <button (click)="toggleMinimize()">{{ isMinimized ? '▲' : '▼' }}</button>
      </header>

      @if (!isMinimized) {
        <main>
          <!-- Contenido aquí -->
        </main>
      }
    </div>
  `
})
export class CustomModalComponent {
  @Input() title: string = '';
  @Input() id: string = '';
  @Input() isMinimized = false;
  
  @Output() minimized = new EventEmitter<{ id: string; title: string }>();
  @Output() restored = new EventEmitter<string>();

  constructor(private minimizedModalService: MinimizedModalService) {}

  toggleMinimize(): void {
    if (this.isMinimized) {
      this.onRestore();
    } else {
      this.onMinimize();
    }
  }

  onMinimize(): void {
    this.minimized.emit({ id: this.id, title: this.title });
    this.minimizedModalService.addMinimized({ id: this.id, title: this.title });
  }

  onRestore(): void {
    this.isMinimized = false;
    this.restored.emit(this.id);
    this.minimizedModalService.removeMinimized(this.id);
  }
}
```

## Directiva MinimizableModalDirective

### API

```typescript
@Directive({
  selector: '[appMinimizable]',
  standalone: true
})
export class MinimizableModalDirective {
  // Inputs
  @Input() isMinimized: boolean;

  // Outputs
  @Output() minimized: EventEmitter<{ id: string; title: string }>;
  @Output() restored: EventEmitter<string>;

  // Métodos
  minimize(id: string, title: string): void;
  restore(id: string): void;
  toggle(id: string, title: string): void;
}
```

### Uso Básico

```html
<div appMinimizable
     [isMinimized]="isMinimized"
     (minimized)="onMinimize($event)"
     (restored)="onRestore($event)">
  <!-- Contenido -->
</div>
```

## MinimizedModalService

### API

```typescript
@Injectable({ providedIn: 'root' })
export class MinimizedModalService {
  // Observable de modales minimizados
  minimizedModals$: Observable<MinimizedModal[]>;
  
  // Observable de solicitudes de restauración
  restoreRequest: Observable<RestoreModalEvent>;

  // Métodos
  addMinimized(modal: Omit<MinimizedModal, 'timestamp'>): void;
  removeMinimized(modalId: string): void;
  restoreMinimized(modalId: string, shouldFocus?: boolean): void;
  getMinimized(): MinimizedModal[];
  isMinimized(modalId: string): boolean;
  clear(): void;
}
```

### Tipos

```typescript
interface MinimizedModal {
  id: string;
  title: string;
  icon?: string;
  timestamp: number;
}

interface RestoreModalEvent {
  id: string;
  shouldFocus: boolean;
}
```

## Animaciones

### Fade Out (Minimizar)
```css
.modal-container {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.modal-minimized {
  opacity: 0;
  pointer-events: none;
}
```

### Fade In (Restaurar)
```css
.modal-container {
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Slide In (Bandeja)
```css
.minimized-tray {
  animation: slideInFromBottom 0.3s ease forwards;
}

@keyframes slideInFromBottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

## Casos de Uso

### 1. Modal de Confirmación Minimizable

```typescript
// En tu componente
deleteItem(id: string): void {
  this.modalService.openConfirm(
    'Eliminar Item',
    '¿Estás seguro de que deseas eliminar este item?',
    true // isDangerous = true, botón rojo
  ).subscribe(result => {
    if (result.confirmed) {
      this.itemService.delete(id).subscribe(() => {
        // Success
      });
    }
  });
}
```

El usuario puede:
- Confirmar/cancelar inmediatamente
- **O minimizar** y seguir trabajando
- Luego restaurar desde la bandeja

### 2. Modal de Formulario Minimizable

```typescript
openEditForm(userId: string): void {
  this.modalService.openForm('Editar Usuario').subscribe(result => {
    if (result.confirmed) {
      this.userService.update(userId, result.data).subscribe(() => {
        // Success
      });
    }
  });
}
```

El usuario puede:
- Llenar el formulario
- **O minimizar** para ver más datos
- Restaurar y terminar

### 3. Múltiples Modales Minimizados

```typescript
// Usuario puede minimizar varios modales
openModal1(); // Modal 1 abierto
openModal2(); // Modal 2 abierto
// Ambos se pueden minimizar

// Bandeja mostrará:
// [Modal 1 ↑] [Modal 2 ↑]

// Click en Modal 1 → restaura Modal 1
// Click en Modal 2 → restaura Modal 2
```

## TypeScript - Sin Type "any"

Todo el sistema usa tipos explícitos:

```typescript
// ✅ Correcto - tipos explícitos
interface MinimizedModal {
  id: string;
  title: string;
  icon?: string;
  timestamp: number;
}

// ✅ Correcto - eventos tipados
@Output() minimized = new EventEmitter<{ id: string; title: string }>();

// ✅ Correcto - métodos tipados
restoreMinimized(modalId: string, shouldFocus = true): void { }

// ❌ NO uses any
@Output() minimized = new EventEmitter<any>(); // ✗
```

## Mobile Responsive

### Desktop
- Bandeja en bottom-left con gap entre botones
- Modales centrados
- Full width max-width 600px

### Tablet (768px)
- Bandeja con scroll horizontal si hay muchos modales
- Modales max-width 500px
- Padding ajustado

### Mobile (320px)
- Bandeja full-width, scroll horizontal
- Modales full-width con margen
- Botones más grandes para touch

```css
/* Mobile */
@media (max-width: 640px) {
  .minimized-tray {
    padding: 12px;
    gap: 8px;
  }

  .modal-container {
    max-width: 100%;
    width: calc(100% - 32px);
  }

  .minimize-button {
    padding: 8px 12px;
    min-height: 44px; /* Touch target */
  }
}
```

## Integración con Otros Módulos

### Con Posts Module
```typescript
// En posts.component.ts
openCreatePostModal(): void {
  this.modalService.openForm('Crear Post').subscribe(result => {
    if (result.confirmed) {
      this.postsService.create(result.data).subscribe(() => {
        // Success
      });
    }
  });
}
// Ya tiene minimización automática
```

### Con Users Module
```typescript
// En users.component.ts
openEditUserModal(userId: string): void {
  this.modalService.openForm('Editar Usuario', 'Guardar').subscribe(result => {
    if (result.confirmed) {
      this.usersService.update(userId, result.data).subscribe(() => {
        // Success
      });
    }
  });
}
// Ya tiene minimización automática
```

### Con Comments Module
```typescript
// En comments.component.ts
openCommentModal(postId: string): void {
  this.modalService.openForm('Nuevo Comentario').subscribe(result => {
    if (result.confirmed) {
      this.commentsService.create(postId, result.data).subscribe(() => {
        // Success
      });
    }
  });
}
// Ya tiene minimización automática
```

## Testing

### Unit Test Ejemplo

```typescript
describe('MinimizableModalDirective', () => {
  it('should emit minimized event when minimize is called', (done) => {
    const directive = new MinimizableModalDirective();
    
    directive.minimized.subscribe((event) => {
      expect(event.id).toBe('modal-1');
      expect(event.title).toBe('Test Modal');
      done();
    });

    directive.minimize('modal-1', 'Test Modal');
  });

  it('should emit restored event when restore is called', (done) => {
    const directive = new MinimizableModalDirective();
    directive.isMinimized = true;
    
    directive.restored.subscribe((id) => {
      expect(id).toBe('modal-1');
      expect(directive.isMinimized).toBe(false);
      done();
    });

    directive.restore('modal-1');
  });
});
```

## Troubleshooting

### Modal no desaparece al minimizar
- Verifica que `appMinimizable` está en el contenedor principal
- Asegúrate que `[isMinimized]` está vinculado correctamente
- Chequea que los estilos incluyen `opacity: 0` y `pointer-events: none`

### Bandeja no aparece
- Verifica que `MinimizedModalsTrayComponent` está en el layout principal (app.component)
- Chequea que `MinimizedModalService` está inyectado
- Verifica que no hay conflicto de z-index

### Modal restaurado no aparece
- Verifica que el modal está vinculado a `minimizedModalService.restoreRequest`
- Asegúrate que el ID coincide exactamente
- Chequea que no hay múltiples instancias del mismo modal

## Performance

- **Memory**: Los modales minimizados se guardan en un BehaviorSubject (memoria O(n))
- **Rendering**: Las animaciones usan CSS transitions (GPU accelerated)
- **Subscriptions**: Se limpian automáticamente con `takeUntil(destroy$)`
- **Change Detection**: Solo los modales minimizados se re-renderean

## Roadmap Futuro

- [ ] Persistencia de modales minimizados en localStorage
- [ ] Reordenar modales en la bandeja (drag & drop)
- [ ] Contador de modales minimizados
- [ ] Keyboard shortcuts (Alt+Tab entre modales)
- [ ] Animaciones de transición personalizables
