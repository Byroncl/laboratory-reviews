@echo off
REM One-click fix and start script
REM Fixes dependency issues and starts development server

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   🚀 FIX & START - Post-Message Docs                      ║
echo ║   This will clean, install, and start the server           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js: && node --version
echo ✅ npm: && npm --version
echo.

REM Step 1: Clean cache
echo [1/4] 🧹 Cleaning npm cache...
call npm cache clean --force
echo.

REM Step 2: Remove node_modules
echo [2/4] 🗑️  Removing node_modules...
if exist "node_modules" (
    rmdir /s /q node_modules
)
if exist "package-lock.json" (
    del package-lock.json
)
echo.

REM Step 3: Install fresh
echo [3/4] 📦 Installing dependencies...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo.
    echo ❌ Installation failed
    pause
    exit /b 1
)
echo.

REM Step 4: Start server
echo [4/4] 🚀 Starting development server...
echo.
echo ════════════════════════════════════════════════════════════
echo 📖 Documentation will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ════════════════════════════════════════════════════════════
echo.

call npm run start

pause
exit /b 0
