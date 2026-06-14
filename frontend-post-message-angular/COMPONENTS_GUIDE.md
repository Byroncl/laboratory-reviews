# UI Components Library Guide

## Componentes Disponibles

### 1. **Table Component** (`app-table`)
Tabla genérica, reutilizable con paginación, ordenamiento y acciones.

```typescript
@Input() columns: TableColumn[]  // Array de columnas
@Input() data: Record<string, unknown>[]  // Datos a mostrar
@Input() actions: TableAction[]  // Array de acciones (edit, delete, view)

@Output() sorted  // Emite {sortBy, sortOrder}
@Output() actionTriggered  // Emite {action, row}
```

**Ejemplo de uso:**
```typescript
columns: TableColumn[] = [
  { key: 'title', label: 'Título', sortable: true },
  { key: 'author', label: 'Autor', sortable: true },
  { key: 'status', label: 'Estado', template: true }
];

actions: TableAction[] = [
  { id: 'edit', label: 'Editar', icon: 'edit', class: 'text-blue-600' },
  { id: 'delete', label: 'Eliminar', icon: 'delete', class: 'text-red-600' }
];

data = [
  { id: '1', title: 'Post 1', author: 'Juan', status: 'published' },
  { id: '2', title: 'Post 2', author: 'María', status: 'draft' }
];
```

---

### 2. **Pagination Component** (`app-pagination`)
Paginación inteligente con navegación y ellipsis.

```typescript
@Input() currentPage: number = 1
@Input() totalPages: number = 1
@Input() pageSize: number = 10
@Input() total: number = 0

@Output() pageChanged  // Emite número de página
```

---

### 3. **Skeleton Component** (`app-skeleton`)
Placeholder para estados de carga.

**Tipos:** `'text' | 'avatar' | 'card' | 'table' | 'chart'`

```html
<app-skeleton type="table"></app-skeleton>
<app-skeleton type="card" [rows]="3"></app-skeleton>
```

---

### 4. **Spinner Component** (`app-spinner`)
Indicador de carga animado.

```typescript
@Input() size: 'sm' | 'md' | 'lg' = 'md'
@Input() text: string = ''  // Texto opcional
```

```html
<app-spinner size="md" text="Cargando datos..."></app-spinner>
```

---

### 5. **Modal Component** (`app-modal`)
Diálogo reutilizable con header, body y footer.

```typescript
@Input() isOpen: boolean = false
@Input() title: string = 'Modal'
@Input() showFooter: boolean = true
@Input() confirmText: string = 'Confirmar'

@Output() closed
@Output() confirmed
@ContentChild('content')  // Slot para contenido
```

**Ejemplo:**
```html
<app-modal [isOpen]="showModal" title="Confirmar eliminación" (confirmed)="onDelete()" (closed)="showModal = false">
  <ng-template #content>
    <p>¿Estás seguro de que deseas eliminar este elemento?</p>
  </ng-template>
</app-modal>
```

---

### 6. **Badge Component** (`app-badge`)
Indicador de estado con 5 variantes.

```typescript
@Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary'
```

```html
<app-badge variant="success">Publicado</app-badge>
<app-badge variant="warning">Borrador</app-badge>
<app-badge variant="danger">Archivado</app-badge>
```

---

## Arquitectura de Carpetas

```
src/app/
├── shared/
│   ├── components/
│   │   ├── table/
│   │   ├── modal/
│   │   ├── skeleton/
│   │   ├── spinner/
│   │   ├── badge/
│   │   ├── pagination/
│   │   └── index.ts (barrel export)
│   └── services/
├── features/
│   └── dashboard/
│       └── pages/
│           ├── posts.component.ts (ejemplo con tabla completa)
│           ├── users.component.ts (implementar con tabla)
│           ├── roles.component.ts (implementar con tabla)
│           ├── permissions.component.ts
│           ├── comments.component.ts
│           └── files.component.ts
```

---

## Próximos Pasos

1. **Aplicar tabla a otros módulos**: Replicar el patrón de `posts.component.ts` en Users, Roles, etc.
2. **Agregar Chart.js**: Para gráficos en reportes
3. **Crear servicio de API**: Reemplazar datos mock con llamadas reales
4. **Agregar filtros avanzados**: Componente reutilizable de filtros
5. **Implementar reportes**: PDF export, CSV export

---

## Exportar desde la Librería

```typescript
// En cualquier componente
import { TableComponent, SkeletonComponent, PaginationComponent, BadgeComponent, SpinnerComponent, ModalComponent } from '@shared/components';
```

---

## Notas Importantes

- ✅ **Sin `any` types**: Todos los componentes tienen tipado correcto
- ✅ **100% Reutilizable**: Diseñados para escalabilidad
- ✅ **Colores personalizados**: Usa variables `primary` y `secondary`
- ✅ **Accesible**: Atributos ARIA y soporta navegación por teclado
- ✅ **Responsive**: Funciona en móvil, tablet y desktop
