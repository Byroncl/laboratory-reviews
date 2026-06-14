@echo off
REM Alternativa: Build y sirve los archivos estáticos

echo ╔════════════════════════════════════════════════════════════╗
echo ║  📚 CONSTRUYENDO DOCUMENTACION...                         ║
echo ║  (Primera vez puede tardar 1-2 minutos)                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Instalar si falta
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install --legacy-peer-deps
    echo.
)

REM Build
echo Construyendo documentación...
call npm run build

if errorlevel 1 (
    echo.
    echo ❌ Build falló
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✅ DOCUMENTACION LISTA                                    ║
echo ║  📖 Sirviendo en: http://localhost:3000                    ║
echo ║  Presiona Ctrl+C para detener                             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Servir
call npm run serve

pause
