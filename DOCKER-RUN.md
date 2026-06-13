# 🐳 Ejecutar Con Docker

Ahora **todo funciona con Docker** - sin problemas de Node, sin conflictos de versiones.

## 🚀 En 2 Comandos

```bash
cd "C:\Users\byron\Documents\laboratory-reviews"
docker-compose up
```

Eso es todo.

---

## 📖 Acceso

Una vez corriendo:

| Servicio | URL |
|----------|-----|
| **Documentación** | http://localhost:3001 |
| **Backend API** | http://localhost:3000 |
| **MinIO Console** | http://localhost:9001 |
| **MongoDB** | mongodb://user:pass@localhost:27017 |

---

## 🔍 Lo que se inicia

```
✅ MongoDB (puerto 27017)
✅ MinIO (puertos 9000, 9001)
✅ NestJS Backend (puerto 3000)
✅ Docusaurus Docs (puerto 3001) ← TU DOCUMENTACIÓN
```

---

## 🛑 Para Detener

Presiona **Ctrl+C** en la terminal, o en otra terminal:

```bash
docker-compose down
```

---

## 📋 Verificar que funciona

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver solo la documentación
docker-compose logs -f docs

# Ver solo el backend
docker-compose logs -f nestjs-app
```

---

## 🔧 Si hay problemas

```bash
# Limpiar todo y reiniciar
docker-compose down -v
docker-compose up --build

# Reconstruir solo la documentación
docker-compose up --build docs
```

---

## ✅ Ventajas

- ✅ Sin conflictos de Node.js
- ✅ Todo aislado en contenedores
- ✅ Mismo entorno en cualquier máquina
- ✅ Fácil de deployar
- ✅ Puedes desarrollar sin instalaciones locales

---

**Listo. Ahora ejecuta:**

```bash
docker-compose up
```

Y abre: **http://localhost:3001** para la documentación 📚
