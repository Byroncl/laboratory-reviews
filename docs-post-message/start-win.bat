@echo off
REM Script para Windows que ejecuta npm start correctamente

echo Instalando dependencias (si falta)...
if not exist "node_modules" (
    npm install --legacy-peer-deps
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  🚀 Iniciando Docusaurus...                               ║
echo ║  📖 Abre: http://localhost:3000                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

npm start

pause
