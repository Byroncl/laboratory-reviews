@echo off
REM Clean install script - Fix dependency issues

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   🧹 CLEANING AND REINSTALLING DEPENDENCIES                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo ⏳ Cleaning npm cache...
call npm cache clean --force
echo ✅ Cache cleaned

echo.
echo ⏳ Removing node_modules...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo ✅ node_modules removed
) else (
    echo ℹ️  node_modules not found
)

echo.
echo ⏳ Removing package-lock.json...
if exist "package-lock.json" (
    del package-lock.json
    echo ✅ package-lock.json removed
) else (
    echo ℹ️  package-lock.json not found
)

echo.
echo ⏳ Installing fresh dependencies...
call npm install --no-save

if errorlevel 1 (
    echo.
    echo ❌ Installation failed
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   ✅ CLEAN INSTALL COMPLETE                                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 🚀 Starting development server...
echo 📖 Documentation will open at: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

call npm run start

pause
