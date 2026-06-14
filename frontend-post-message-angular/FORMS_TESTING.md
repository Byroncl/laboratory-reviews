# Forms Testing Guide

Complete forms have been created for Users, Posts, Roles, and Permissions with full validation and integration into the dashboard. All forms are production-ready with error handling, loading states, and success/error notifications.

## Forms Created

### 1. User Form Component
**File**: `src/app/features/dashboard/components/user-form.component.ts`

**Features**:
- Create and edit users
- Field validation:
  - Name: Required, 2-50 characters
  - Lastname: Required, 2-50 characters
  - Username: Required, 3-20 characters (lowercased)
  - Email: Required, valid email format
  - Password: Required for create mode only, 6-200 characters
  - Type: Required (admin, editor, viewer)
- Real-time validation errors display
- Loading state during submission
- Success/error toasts

**Endpoints**:
- Create: `POST /users`
- Update: `PUT /users/{id}`

---

### 2. Post Form Component
**File**: `src/app/features/dashboard/components/post-form.component.ts`

**Features**:
- Create and edit posts
- Field validation:
  - Title: Required, 3-200 characters
  - Content: Required, 1-5000 characters with character counter
  - Image URL (optional): Valid URL starting with http:// or https://
  - Image Filename (optional): Max 500 characters
  - Category ID (optional): MongoDB ObjectId format
  - Category Name (optional): Max 100 characters
- Character counter for content field
- Optional image and category fields
- Loading state and error handling

**Endpoints**:
- Create: `POST /posts`
- Update: `PUT /posts/{id}`

---

### 3. Role Form Component
**File**: `src/app/features/dashboard/components/role-form.component.ts`

**Features**:
- Create and edit roles
- Field validation:
  - Name: Required, 2-100 characters
  - Permissions: Required, select at least one permission
- Scrollable permissions list with checkboxes
- Permission type display (user, roles, permissions, etc.)
- Shows count of selected permissions
- Dynamically loads available permissions from API

**Endpoints**:
- Create: `POST /roles`
- Update: `PUT /roles/{id}`
- Load permissions: `GET /permissions`

---

### 4. Permission Form Component
**File**: `src/app/features/dashboard/components/permission-form.component.ts`

**Features**:
- Create and edit permissions
- Field validation:
  - Name: Required, 2-100 characters
  - Type: Required, enum validation (user, roles, permissions, comments, clients, statistics, audits)
- Descriptive type information box
- Clear category definitions
- Reactive forms validation

**Endpoints**:
- Create: `POST /permissions`
- Update: `PUT /permissions/{id}`

---

## Dashboard Integration

All forms are integrated into their respective dashboard pages:

### Users Page
- Navigate to: Dashboard → Users
- Click "Nuevo Usuario" button to create
- Click "Editar" action on any row to edit
- Form slides in as a modal within the same page

### Posts Page
- Navigate to: Dashboard → Posts
- Click "Nuevo Post" button to create
- Click "Editar" action on any row to edit
- Character counter shows real-time content length

### Roles Page
- Navigate to: Dashboard → Roles
- Click "Nuevo Rol" button to create
- Click "Editar" action on any row to edit
- Permissions load automatically on form open

### Permissions Page
- Navigate to: Dashboard → Permissions
- Click "Nuevo Permiso" button to create
- Click "Editar" action on any row to edit
- Type descriptions help users understand permission categories

---

## How to Test

### 1. Test User Form

```bash
# 1. Navigate to Dashboard → Users
# 2. Click "Nuevo Usuario"
# 3. Test validation by leaving fields empty - should show errors
# 4. Try invalid email - should show "Email inválido"
# 5. Try username with spaces - should be converted to lowercase
# 6. Fill all required fields:
#    - Name: Juan (min 2, max 50)
#    - Lastname: Pérez (min 2, max 50)
#    - Username: juan.perez (min 3, max 20, auto lowercase)
#    - Email: juan@example.com (valid email)
#    - Password: password123 (min 6, max 200)
#    - Type: Select "admin", "editor", or "viewer"
# 7. Click "Crear Usuario"
# 8. Should see success toast: "Usuario creado correctamente"
# 9. Form should close automatically
# 10. New user appears in the list
```

**Test Edit**:
```bash
# 1. Click edit action on any user row
# 2. Form opens with pre-filled data
# 3. Password field should NOT appear in edit mode
# 4. Modify any field (except password)
# 5. Click "Actualizar Usuario"
# 6. Should see success toast: "Usuario actualizado correctamente"
```

### 2. Test Post Form

```bash
# 1. Navigate to Dashboard → Posts
# 2. Click "Nuevo Post"
# 3. Test required fields validation
# 4. Test character limits:
#    - Title: min 3, max 200 (shows real-time error)
#    - Content: min 1, max 5000 (shows character counter: "0 / 5000")
# 5. Test optional URL validation:
#    - Try "not-a-url" - shows error
#    - Try "http://example.com/image.jpg" - valid
#    - Try "https://example.com/image.jpg" - valid
# 6. Fill form:
#    - Title: "Mi Primer Post"
#    - Content: "Este es el contenido del post..."
#    - ImageUrl (optional): "http://localhost:9000/image.jpg"
#    - ImageFilename (optional): "1718000000000-photo.jpg"
#    - CategoryId (optional): "507f1f77bcf86cd799439011"
#    - CategoryName (optional): "Backend"
# 7. Click "Crear Post"
# 8. Should see success toast and form closes
# 9. New post appears in the list
```

**Test Character Counter**:
```bash
# 1. Click in content field
# 2. Type a few characters
# 3. Counter updates in real-time: "123 / 5000"
# 4. Try to exceed 5000 - field should truncate input
```

### 3. Test Role Form

```bash
# 1. Navigate to Dashboard → Roles
# 2. Click "Nuevo Rol"
# 3. Test required fields:
#    - Name: required, 2-100 characters
#    - Permissions: must select at least one
# 4. Watch permissions load from API
# 5. Select multiple permissions by clicking checkboxes
# 6. Counter shows: "2 permisos seleccionados"
# 7. Fill form:
#    - Name: "Moderador"
#    - Permissions: Check 3-4 permissions (e.g., user, comments, statistics)
# 8. Click "Crear Rol"
# 9. Should see success toast
# 10. Verify new role in table with selected permissions
```

**Test Edit with Permissions**:
```bash
# 1. Click edit on any role
# 2. Previously selected permissions should be checked
# 3. Add/remove permissions as needed
# 4. Click "Actualizar Rol"
# 5. Success message confirms update
```

### 4. Test Permission Form

```bash
# 1. Navigate to Dashboard → Permissions
# 2. Click "Nuevo Permiso"
# 3. Test validation:
#    - Name: required, 2-100 characters
#    - Type: required, must select from enum
# 4. Type information box shows all available types
# 5. Fill form:
#    - Name: "Eliminar Usuario"
#    - Type: "user"
# 6. Click "Crear Permiso"
# 7. See success toast and form closes
# 8. New permission available for role assignments
```

---

## Validation Rules Summary

| Form | Field | Rule | Error Message |
|------|-------|------|---------------|
| User | name | Required, 2-50 chars | Campo requerido / Mínimo 2 caracteres |
| User | username | Required, 3-20 chars | Campo requerido / Mínimo 3 caracteres |
| User | email | Required, valid email | Campo requerido / Email inválido |
| User | password | Required*, 6-200 chars | Campo requerido / Mínimo 6 caracteres |
| User | type | Required, enum | Campo requerido |
| Post | title | Required, 3-200 chars | Campo requerido / Mínimo 3 caracteres |
| Post | content | Required, 1-5000 chars | Campo requerido |
| Post | imageUrl | Optional, valid URL | URL debe comenzar con http:// o https:// |
| Role | name | Required, 2-100 chars | Campo requerido / Mínimo 2 caracteres |
| Role | permissions | Required, at least 1 | Debe seleccionar al menos un permiso |
| Permission | name | Required, 2-100 chars | Campo requerido / Mínimo 2 caracteres |
| Permission | type | Required, enum | Campo requerido |

*Password only required in create mode, not in edit mode.

---

## Services Used

All forms use existing Angular services:

- **UsersService**: `src/app/features/admin/services/users.service.ts`
- **PostsService**: `src/app/features/posts/services/posts.service.ts`
- **RolesService**: `src/app/features/admin/services/roles.service.ts`
- **PermissionsService**: `src/app/features/admin/services/permissions.service.ts`
- **NotificationService**: Toast notifications on success/error

---

## API Endpoints

The forms submit to these backend endpoints:

```
POST   /users                 - Create user
PUT    /users/{id}           - Update user
POST   /posts                - Create post
PUT    /posts/{id}           - Update post
POST   /roles                - Create role
PUT    /roles/{id}           - Update role
GET    /permissions          - Load available permissions
POST   /permissions          - Create permission
PUT    /permissions/{id}     - Update permission
```

---

## Error Handling

All forms include:
- Client-side validation with real-time error messages
- Server-side error handling with user-friendly toasts
- Loading states disable form submission during API calls
- Fields show red border when invalid
- Specific error messages for each validation rule

---

## Testing Checklist

- [ ] User form creates new user with all fields validated
- [ ] User form edit loads user data and updates correctly
- [ ] Post form creates post with character counter working
- [ ] Post form URL validation accepts valid URLs only
- [ ] Role form loads permissions dynamically
- [ ] Role form requires at least one permission selection
- [ ] Permission form validates type enum correctly
- [ ] All forms show loading spinner during submission
- [ ] All forms display success toast on completion
- [ ] All forms close and update table after success
- [ ] All forms display error toasts on failure
- [ ] Form validation shows errors in red
- [ ] All disabled state buttons work correctly
- [ ] Edit mode pre-fills form with existing data
- [ ] Cancel buttons close forms without saving
