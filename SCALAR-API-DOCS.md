# 📚 Scalar API Documentation

Se ha cambiado de **Swagger UI** a **Scalar** para una mejor experiencia de documentación de API.

## ¿Por qué Scalar?

✨ **Mejor interfaz visual** - Más moderna y intuitiva
⚡ **Mejor rendimiento** - Más ligero que Swagger
🎨 **Temas personalizables** - Modo oscuro/claro
🔍 **Mejor búsqueda** - Encontrar endpoints rápidamente
📱 **Responsive** - Funciona perfecto en móvil
🚀 **Más rápido** - Carga más rápido que Swagger

## Acceder a Scalar

### Desarrollo Local

```
http://localhost:3000/api/docs
```

### Con Docker

```
http://localhost:3000/api/docs
```

## Características de Scalar

### 1. **Exploración de Endpoints**
- Lista todos los endpoints disponibles
- Agrupa por etiquetas (tags)
- Búsqueda rápida

### 2. **Testing de API**
- Prueba endpoints directamente
- Configura headers y body
- Ver respuestas en tiempo real
- Guarda requests favoritas

### 3. **Autenticación**
- Soporte para Bearer tokens
- Configura el token una vez
- Se aplica a todos los requests

### 4. **Documentación interactiva**
- Schemas de request/response
- Ejemplos de uso
- Códigos de estado HTTP
- Descripciones detalladas

## Cómo usar Scalar

### 1. Explorar endpoints

```
1. Abre http://localhost:3000/api/docs
2. Ve la lista de endpoints en el panel izquierdo
3. Haz click en un endpoint para ver detalles
```

### 2. Probar un endpoint

```
1. Selecciona un endpoint
2. Haz click en "Try it"
3. Rellena los parámetros si es necesario
4. Haz click en "Send"
5. Ve la respuesta en el panel derecho
```

### 3. Agregar autenticación

```
1. Obtén un token JWT haciendo login en /api/auth/login
2. En Scalar, busca el icono de "Auth" o "Security"
3. Pega el token
4. Todos los requests siguientes incluirán el token
```

### 4. Explorar schemas

```
1. Ve a la sección "Schemas"
2. Busca el schema que quieras entender
3. Ve la estructura de datos y ejemplos
```

## Endpoints principales

```
POST   /api/auth/login              - Iniciar sesión
POST   /api/auth/register           - Registrarse
GET    /api/posts                   - Listar posts
POST   /api/posts                   - Crear post
GET    /api/posts/:id               - Obtener post
PUT    /api/posts/:id               - Actualizar post
DELETE /api/posts/:id               - Eliminar post

GET    /api/users                   - Listar usuarios
GET    /api/users/:id               - Obtener usuario
PUT    /api/users/:id               - Actualizar usuario

GET    /api/roles                   - Listar roles
GET    /api/permissions             - Listar permisos

GET    /api/health                  - Health check
```

## Tema oscuro (por defecto)

La configuración actual usa tema oscuro (`theme: 'dark'`).

Para cambiar a tema claro, edita `src/bootstrap/swagger.ts`:

```typescript
apiReference({
  spec: {
    content: document,
  },
  pageTitle: 'Post Message API - Scalar',
  theme: 'light',  // Cambiar a 'light'
}),
```

## Comparativa: Swagger vs Scalar

| Feature | Swagger | Scalar |
|---------|---------|--------|
| Interfaz | Funcional | Moderna |
| Rendimiento | Bueno | Excelente |
| Testing | Sí | Sí |
| Móvil | Bueno | Excelente |
| Tema oscuro | No | Sí |
| Búsqueda | Básica | Avanzada |
| Guardado | No | Sí |
| Tamaño | 2.5MB | 0.5MB |

## Archivos modificados

### `src/bootstrap/swagger.ts`
- ❌ Removido: `SwaggerModule.setup()`
- ✅ Agregado: `apiReference()` de Scalar
- ✅ Tema: Dark mode
- ✅ Agregado: Host para Docker

## Comandos útiles

```bash
# Ver la documentación
curl http://localhost:3000/api/docs

# Obtener especificación OpenAPI
curl http://localhost:3000/api/docs-json

# Probar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Probar endpoint autenticado
curl http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Scalar no carga (404)

```bash
# Verificar que el endpoint existe
curl http://localhost:3000/api/docs -v

# Ver logs del backend
docker-compose logs -f nestjs-app

# Rebuild
docker-compose build --no-cache nestjs-app
docker-compose restart nestjs-app
```

### Requests fallan con 401 Unauthorized

```
Solución: Copia tu token JWT y pégalo en el panel de autenticación
```

### El tema no se ve bien

```bash
# Asegúrate de tener JavaScript habilitado
# Usa un navegador moderno (Chrome, Firefox, Safari)
# Limpia el cache del navegador (Ctrl+Shift+Del)
```

## Próximos pasos

1. Accede a http://localhost:3000/api/docs
2. Explora los endpoints disponibles
3. Usa "Try it" para probar endpoints
4. Agrega tu token de autenticación
5. ¡Disfruta de la mejor experiencia de documentación! 🎉

## Recursos

- **Scalar Docs**: https://docs.scalar.com/
- **NestJS Swagger**: https://docs.nestjs.com/openapi/introduction
- **OpenAPI Spec**: https://swagger.io/specification/

---

**Scalar está activo en**: `/api/docs` 📚
