# ⚠️ IMPORTANTE: Versión de Node.js

## El Problema

Tienes instalado **Node.js v24.13.1**, pero Docusaurus 2.4.1 tiene incompatibilidad con webpack en Node 24.

**El error**: `ValidationError: Invalid options object. Progress Plugin`

## La Solución

**Debes usar Node.js 20 (LTS) o Node.js 18**

### Paso 1: Desinstala Node 24

1. Abre "Agregar o quitar programas" (Windows)
2. Busca "Node.js"
3. Desinstala la versión actual

### Paso 2: Instala Node.js 20 LTS

1. Descarga: https://nodejs.org/
2. Descarga la versión **LTS** (20.x)
3. Ejecuta el instalador
4. Reinicia tu computadora

### Paso 3: Verifica la instalación

Abre Command Prompt y ejecuta:

```bash
node --version
npm --version
```

Debe mostrar algo como:
```
v20.10.0
10.2.3
```

### Paso 4: Ahora ejecuta

```bash
npm install --legacy-peer-deps
npm start
```

Debería funcionar perfectamente ✅

---

## ¿Por qué?

- Node 24 es **experimental** (salió hace poco)
- Docusaurus 2.4.1 usa webpack con opciones que Node 24 cambió
- Node 20 LTS es **estable y recomendado**

---

## Verificación Rápida

En Command Prompt:

```bash
node --version
```

- ✅ v20.x → ¡Funcionará!
- ✅ v18.x → ¡Funcionará!
- ❌ v24.x → Necesitas cambiar

---

**Después de cambiar Node a v20, ejecuta:**

```bash
npm install --legacy-peer-deps
npm start
```

¡Listo! 🚀
