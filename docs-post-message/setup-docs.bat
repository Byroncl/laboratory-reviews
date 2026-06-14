@echo off
REM ============================================
REM Post-Message Documentation Setup Script
REM Automatic installer and runner for Docusaurus
REM ============================================

setlocal enabledelayedexpansion
chcp 65001 >nul

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   📚 POST-MESSAGE DOCUMENTATION SETUP                      ║
echo ║   Docusaurus - Backend & Frontend Documentation            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found: && node --version
echo ✅ npm found: && npm --version
echo.

REM Check if node_modules exists and handle installation
if not exist "node_modules" (
    echo 📦 Installing dependencies (first time)...
    echo.
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo.
        echo ⚠️  Installation had issues. Trying clean install...
        echo.
        call npm cache clean --force
        call npm install --legacy-peer-deps
        if errorlevel 1 (
            echo ❌ npm install failed
            pause
            exit /b 1
        )
    )
    echo.
    echo ✅ Dependencies installed
) else (
    echo ✅ node_modules already exists
    echo.
    echo Do you want to:
    echo 1) Continue with current installation
    echo 2) Clean reinstall (fix dependency issues)
    echo 3) Exit
    echo.
    set /p action="Choose (1-3): "
    if "!action!"=="2" (
        echo.
        echo 🧹 Cleaning npm cache...
        call npm cache clean --force
        echo ✅ Cache cleaned
        echo.
        echo 📦 Reinstalling dependencies...
        call npm install --legacy-peer-deps
    ) else if "!action!"=="3" (
        exit /b 0
    )
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   CHOOSE AN OPTION                                         ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║   1) Start development server (port 3000)                  ║
echo ║   2) Build for production                                  ║
echo ║   3) Serve built documentation                             ║
echo ║   4) Clear cache and rebuild                               ║
echo ║   5) Exit                                                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set /p choice="Choose option (1-5): "

if "!choice!"=="1" (
    echo.
    echo 🚀 Starting development server...
    echo 📖 Documentation will open at: http://localhost:3000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    call npm run start
) else if "!choice!"=="2" (
    echo.
    echo 🏗️  Building documentation...
    call npm run build
    if errorlevel 1 (
        echo ❌ Build failed
        pause
        exit /b 1
    )
    echo.
    echo ✅ Build complete! Output in ./build/
) else if "!choice!"=="3" (
    echo.
    echo 📦 Building if needed...
    if not exist "build" (
        echo 🏗️  Building documentation...
        call npm run build
    )
    echo.
    echo 🌐 Serving documentation...
    echo 📖 Open: http://localhost:3000
    call npm run serve
) else if "!choice!"=="4" (
    echo.
    echo 🗑️  Clearing cache...
    call npm run clear
    echo.
    echo 🏗️  Rebuilding...
    call npm run build
    if errorlevel 1 (
        echo ❌ Build failed
        pause
        exit /b 1
    )
    echo.
    echo ✅ Cache cleared and rebuilt!
) else if "!choice!"=="5" (
    echo.
    echo 👋 Goodbye!
    exit /b 0
) else (
    echo.
    echo ❌ Invalid choice. Please select 1-5
    timeout /t 2 >nul
    goto start
)

echo.
pause
exit /b 0
