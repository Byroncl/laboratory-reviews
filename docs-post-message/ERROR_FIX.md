# ❌ Error: Cannot find package 'chalk'

Si ves este error:

```
Error: Cannot find package 'C:\Users\...\node_modules\update-notifier\node_modules\chalk\index.js'
```

## ⚡ Solución Rápida (1 Minuto)

**Haz doble clic en: `fix-and-start.bat`**

El script:
1. ✅ Limpia cache de npm
2. ✅ Elimina dependencias viejas
3. ✅ Reinstala limpiamente
4. ✅ Inicia automáticamente

---

## 🔧 Si lo anterior no funciona

### Opción A: Ejecutar limpieza completa

```bash
clean-install.bat
```

### Opción B: Manual en Command Prompt

Copia y pega esto:

```bash
npm cache clean --force && rmdir /s /q node_modules && del package-lock.json && npm install --legacy-peer-deps && npm run start
```

### Opción C: PowerShell

```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install --legacy-peer-deps
npm run start
```

---

## 📚 Ver más soluciones

Abre el archivo: `TROUBLESHOOTING.md`

---

## ✅ Verificar que funcionó

Después de ejecutar el script, deberías ver:

```
ℹ️ ▲ [info] Docusaurus server started on http://localhost:3000
```

Entonces abre en tu navegador: **http://localhost:3000**

---

**Rápido y simple. Confía en los scripts.** 🚀
