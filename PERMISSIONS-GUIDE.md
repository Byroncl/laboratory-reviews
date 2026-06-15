# Sistema de Permisos y Control de Acceso

## 📋 Descripción General

El sistema implementa RBAC (Role-Based Access Control) completo tanto en backend como en frontend:

- **Backend**: Decorador `@HasPermission()` + Guard `PermissionsGuard`
- **Frontend**: Directivas `appHasPermission` y `appHasRole` + Servicio `PermissionsService`

---

## 🔐 Backend - Roles y Permisos

### Roles disponibles:

```typescript
enum RoleIdentifier {
  ADMIN = 'admin',
  CLIENT = 'client',
  USER = 'user',
}
```

### Permisos por rol:

#### Admin
```
- manage_users
- manage_roles
- manage_permissions
- view_audit_logs
- manage_clients
- manage_posts
- manage_comments
- view_statistics
- view_dashboard
```

#### Client
```
- create_posts
- edit_own_posts
- delete_own_posts
- create_comments
- view_own_profile
- edit_own_profile
- create_favorites
- view_favorites
```

#### User
```
- view_public_posts
- view_comments
```

### Uso en endpoints (Backend):

```typescript
// Protejer endpoint con permiso específico
@Controller('posts')
@UseGuards(PermissionsGuard)
export class PostsController {
  
  @Post()
  @HasPermission('manage_posts')
  async createPost(@Body() dto: CreatePostDto) {
    // Solo usuarios/admins con permiso 'manage_posts'
  }

  @Delete(':id')
  @HasPermission('manage_posts')
  async deletePost(@Param('id') id: string) {
    // Solo usuarios/admins con permiso 'manage_posts'
  }
}
```

---

## 🎨 Frontend - Directivas y Servicio

### 1. Directiva `appHasPermission`

Muestra/oculta elementos del DOM según permisos del usuario.

#### Sintaxis básica:

```html
<!-- Un solo permiso -->
<button *appHasPermission="'create_posts'">
  Crear Post
</button>

<!-- Múltiples permisos (OR - al menos uno) -->
<div *appHasPermission="['create_posts', 'manage_posts']">
  Panel de Posts
</div>

<!-- Múltiples permisos (AND - todos requeridos) -->
<div *appHasPermission="['create_posts', 'edit_own_posts']" [appHasPermissionRequireAll]="true">
  Editor Completo
</div>
```

#### Ejemplo en componente:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasPermissionDirective } from './directives/has-permission.directive';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
  template: `
    <div class="editor">
      <input *appHasPermission="'create_posts'" 
             type="text" 
             placeholder="Título del post">
      
      <textarea *appHasPermission="'create_posts'" 
                placeholder="Contenido"></textarea>
      
      <button *appHasPermission="['create_posts', 'manage_posts']">
        Publicar
      </button>
    </div>
  `
})
export class PostEditorComponent {}
```

---

### 2. Directiva `appHasRole`

Muestra/oculta elementos según el rol del usuario.

#### Sintaxis:

```html
<!-- Admin solo -->
<div *appHasRole="'admin'">
  Panel de Administración
</div>

<!-- Cliente o Admin -->
<div *appHasRole="['client', 'admin']">
  Contenido para clientes
</div>
```

#### Ejemplo:

```html
<div class="dashboard">
  <div *appHasRole="'admin'">
    <h2>Panel Admin</h2>
    <button>Gestionar Usuarios</button>
    <button>Ver Auditoría</button>
  </div>

  <div *appHasRole="'client'">
    <h2>Panel Cliente</h2>
    <button>Mis Posts</button>
    <button>Mis Favoritos</button>
  </div>
</div>
```

---

### 3. Servicio `PermissionsService`

Gestiona permisos del usuario autenticado.

#### Métodos disponibles:

```typescript
import { PermissionsService } from './core/services/permissions.service';

export class MyComponent {
  constructor(private permissionsService: PermissionsService) {}

  // Verificar un permiso
  canCreatePost = this.permissionsService.canAccess('create_posts');

  // Métodos imperativos
  hasPermission(): boolean {
    return this.permissionsService.hasPermission('create_posts');
  }

  hasAnyPermission(): boolean {
    return this.permissionsService.hasAnyPermission([
      'create_posts',
      'manage_posts'
    ]);
  }

  hasAllPermissions(): boolean {
    return this.permissionsService.hasAllPermissions([
      'create_posts',
      'edit_own_posts'
    ]);
  }

  isAdmin(): boolean {
    return this.permissionsService.isAdmin();
  }

  isClient(): boolean {
    return this.permissionsService.isClient();
  }
}
```

#### Propiedades Signals:

```typescript
// Acceso a signals reactivos
userRole = this.permissionsService.userRole; // signal<UserRole | null>
permissions = this.permissionsService.userPermissions; // signal<string[]>

// Computed signals
canAccess = this.permissionsService.canAccess;
hasRole = this.permissionsService.hasRole;
```

---

## 🔄 Flujo de Inicialización

1. **Login**: Usuario inicia sesión
   ```typescript
   AuthActions.login({ username, password })
   ```

2. **JWT Decode**: Se decodifica el token para obtener rol
   ```typescript
   const claims = decodeJwt(access_token);
   const user = { 
     id: claims.sub, 
     username: claims.username, 
     role: claims.type // 'admin', 'client', 'user'
   };
   ```

3. **Load Permissions**: Se cargan los permisos según el rol
   ```typescript
   this.permissionsService.setUserRole({
     id: user.id,
     name: user.role,
     identifier: user.role,
     permissions: this.getRolePermissions(user.role)
   });
   ```

4. **Ready**: Las directivas están listas para usar

5. **Logout**: Se limpian los permisos
   ```typescript
   this.permissionsService.clear();
   ```

---

## 📝 Ejemplo Completo: Gestor de Posts

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { PermissionsService } from './services/permissions.service';

@Component({
  selector: 'app-posts-manager',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
  template: `
    <div class="posts-manager">
      <h1>Gestor de Posts</h1>

      <!-- Botón para crear solo si tiene permiso -->
      <button *appHasPermission="'create_posts'" 
              class="btn btn-primary"
              (click)="createPost()">
        ➕ Nuevo Post
      </button>

      <!-- Tabla de posts con acciones -->
      <table class="posts-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let post of posts">
            <td>{{ post.title }}</td>
            <td>{{ post.author }}</td>
            <td class="actions">
              <!-- Editar solo si tiene permiso -->
              <button *appHasPermission="'edit_own_posts'"
                      (click)="editPost(post.id)">
                ✏️ Editar
              </button>

              <!-- Eliminar solo para admins -->
              <button *appHasPermission="'manage_posts'"
                      (click)="deletePost(post.id)"
                      class="btn-danger">
                🗑️ Eliminar
              </button>

              <!-- Ver detalles para todos -->
              <button (click)="viewPost(post.id)">
                👁️ Ver
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Sección admin solo -->
      <div *appHasPermission="'manage_posts'" class="admin-section">
        <h3>Estadísticas (Solo Admin)</h3>
        <p>Total de posts: {{ totalPosts }}</p>
      </div>
    </div>
  `,
  styles: [`
    .posts-manager {
      padding: 20px;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .admin-section {
      background-color: #f0f0f0;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
    }
  `]
})
export class PostsManagerComponent implements OnInit {
  posts: any[] = [];
  totalPosts = 0;

  constructor(
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    // Verificar si puede crear posts
    if (this.permissionsService.hasPermission('create_posts')) {
      this.loadPosts();
    }
  }

  createPost() {
    if (!this.permissionsService.hasPermission('create_posts')) {
      alert('No tienes permiso para crear posts');
      return;
    }
    // Lógica para crear post
  }

  editPost(id: string) {
    if (!this.permissionsService.hasPermission('edit_own_posts')) {
      alert('No tienes permiso para editar posts');
      return;
    }
    // Lógica para editar
  }

  deletePost(id: string) {
    if (!this.permissionsService.hasPermission('manage_posts')) {
      alert('No tienes permiso para eliminar posts');
      return;
    }
    // Lógica para eliminar
  }

  viewPost(id: string) {
    // Ver siempre disponible
  }

  loadPosts() {
    // Cargar posts
  }
}
```

---

## 🛡️ Best Practices

### 1. **Siempre validar también en el servidor**
La directiva es solo para UX. La validación real debe ser en el servidor.

```typescript
// ✅ CORRECTO: Validar en servidor
@Post()
@HasPermission('create_posts')
async create(@Body() dto: CreatePostDto) {
  // Backend valida de nuevo
}

// ❌ INCORRECTO: Solo confiar en frontend
@Post()
async create(@Body() dto: CreatePostDto) {
  // Sin validación en servidor
}
```

### 2. **Usar directivas para UX, servicio para lógica**

```typescript
// ✅ CORRECTO: Directiva para mostrar/ocultar UI
<button *appHasPermission="'create_posts'">Crear</button>

// ✅ CORRECTO: Servicio para lógica condicional
if (this.permissionsService.hasPermission('create_posts')) {
  this.makeApiCall();
}
```

### 3. **Mapear permisos claros y específicos**

```typescript
// ✅ CORRECTO: Permisos específicos
- create_posts
- edit_own_posts
- edit_all_posts
- delete_own_posts
- delete_all_posts

// ❌ INCORRECTO: Permisos genéricos
- post_access
- content_management
```

### 4. **Documentar cambios de permisos**

Cuando agregues nuevos permisos:
1. Actualiza el backend (Permission schema)
2. Actualiza los roles (Role schema)
3. Actualiza el frontend (`getRolePermissions()` en effects)
4. Actualiza esta documentación

---

## 🔗 Archivos Relacionados

- **Backend**:
  - `/core/decorators/has-permission.decorator.ts`
  - `/core/guards/permissions.guard.ts`
  - `/modules/roles/schemas/role.schema.ts`
  - `/modules/permissions/schemas/permission.schema.ts`

- **Frontend**:
  - `/core/services/permissions.service.ts`
  - `/core/directives/has-permission.directive.ts`
  - `/core/directives/has-role.directive.ts`
  - `/features/auth/store/auth.effects.ts`

---

## ⚡ Performance

El sistema usa **Signals** de Angular para reactividad sin cambios de detección:

```typescript
// Signals = cambios automáticos sin ChangeDetectionStrategy
userPermissions = signal<string[]>([]);

// Computed = cálculos reactivos
canAccess = computed(() => (permission: string) => 
  this.userPermissions().includes(permission)
);
```

Esto asegura que:
- ✅ Cambios instantáneos en permisos
- ✅ Cero re-renders innecesarios
- ✅ Máximo rendimiento
