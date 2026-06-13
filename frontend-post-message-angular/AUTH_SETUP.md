# Autenticación Frontend - Angular 18 + Tailwind + NgRx

## ✅ Completado

### 1. Configuración de Tailwind CSS
- Instalado tailwindcss, postcss, autoprefixer
- Configurado en `tailwind.config.js` con content paths
- Directivas `@tailwind` añadidas a `src/styles.scss`

### 2. NgRx Store (State Management)
- `auth.model.ts` - Interfaces User y AuthState
- `auth.actions.ts` - Acciones para login, register, logout
- `auth.reducer.ts` - Reducer que maneja el estado con localStorage
- `auth.selectors.ts` - Selectores para acceder al estado
- Configurado en `app.config.ts` con `provideStore()`

### 3. Componentes de Autenticación

#### LoginComponent (`/auth/login`)
- Formulario reactivo con validación
- Email: requerido + email válido
- Password: requerido + mínimo 6 caracteres
- Toggle de visibilidad de contraseña
- Loading state con spinner
- Layout two-column (logo izquierda, formulario derecha)

#### RegisterComponent (`/auth/register`)
- Campos: nombre, email, password, confirmPassword
- Validador customizado para password match
- Similar diseño al login

### 4. Servicios
- `AuthService` - Métodos para login/register (preparados para API)
- Inyección de dependencias configurada

### 5. Diseño UI
- **Colores**: Gradient azul (from-blue-50 to-indigo-100)
- **Layout**: Flex two-column en desktop, responsivo en móvil
- **Componentes**: Inputs validados, buttons con hover, error messages
- **Logo**: Posicionado a la izquierda (usando /public/images/logos/hero-login.png)

### 6. Routing
```
/auth/login      → LoginComponent
/auth/register   → RegisterComponent
/                → Redirige a /auth/login
```

## 🎯 Implementado según especificación

- ✅ Formularios reactivos con validaciones requeridas
- ✅ RxJS operators (switchMap, tap, catchError en effects)
- ✅ NgRx para estado global (como Redux)
- ✅ Login persistence en localStorage
- ✅ UX: validación visual, loading states, error messages
- ✅ Tailwind CSS para estilos

## 📋 Próximos pasos

1. **Mock auth API** - Implementar endpoints en backend
2. **JWT Interceptor** - Agregar token a requests
3. **Dashboard component** - Crear /dashboard route
4. **Auth Guard** - CanActivateFn para proteger rutas
5. **Session recovery** - loadAuthFromStorage effect
6. **Logout** - Botón en navbar
7. **Error mapping** - Convertir errores API a mensajes UI-friendly
8. **Effects arreglados** - Implementar login/register effects correctamente

## 📁 Estructura

```
src/app/
├── features/auth/
│   ├── models/
│   │   └── auth.model.ts
│   ├── pages/
│   │   ├── login/
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   └── login.component.scss
│   │   └── register/
│   │       ├── register.component.ts
│   │       ├── register.component.html
│   │       └── register.component.scss
│   ├── services/
│   │   └── auth.service.ts
│   ├── store/
│   │   ├── auth.actions.ts
│   │   ├── auth.reducer.ts
│   │   ├── auth.selectors.ts
│   │   └── auth.effects.ts
│   ├── auth.component.ts
│   └── auth.routes.ts
├── app.config.ts (NgRx providers)
└── app.routes.ts (Auth routes)
```

## 🚀 Para ejecutar

```bash
npm start
# http://localhost:4200/auth/login
```

## 📸 UI Preview

- Login con logo a la izquierda y formulario a la derecha
- Validación en tiempo real
- Mensajes de error claros
- Estados de loading con spinner
- Responsive en móvil (logo oculto con `lg:hidden`)
