# 🐳 INICIAR TODO CON DOCKER

## 1️⃣ Asegúrate de tener Docker instalado

```bash
docker --version
docker-compose --version
```

Si no está instalado: https://www.docker.com/products/docker-desktop

---

## 2️⃣ Ejecuta en la carpeta raíz del proyecto

```bash
cd "C:\Users\byron\Documents\laboratory-reviews"
docker-compose up
```

**Espera 1-2 minutos** a que Docker descargue las imágenes y levante los contenedores.

---

## 3️⃣ Abre en tu navegador

- **📚 Documentación**: http://localhost:3001
- **🚀 Backend API**: http://localhost:3000
- **📦 MinIO Storage**: http://localhost:9001

---

## ✅ Listo

Deberías ver:

```
✅ mi_mongo is up-to-date
✅ mi_minio is up-to-date
✅ mi_nestjs | [Nest] 12:34:56 - 06/13/2024
✅ mi_docs | [INFO] Starting the development server...
✅ mi_docs | [SUCCESS] Docusaurus website is running at: http://localhost:3001/
```

---

## 🛑 Para detener

Presiona **Ctrl+C** o ejecuta:

```bash
docker-compose down
```

---

## 📝 Notas

- Los contenedores se reinician automáticamente si se cierran
- Los archivos de código se sincronizan en tiempo real
- Puedes hacer cambios en `docs/` y verlos en http://localhost:3001
- Para rebuild: `docker-compose up --build`

---

**¡Listo! Disfruta tu documentación dockerizada! 🚀**
