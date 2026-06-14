# ============================================
# Post-Message Documentation Setup Script
# PowerShell version for Windows
# ============================================

$ErrorActionPreference = "Continue"

function Write-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   📚 POST-MESSAGE DOCUMENTATION SETUP                      ║" -ForegroundColor Cyan
    Write-Host "║   Docusaurus - Backend & Frontend Documentation            ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Check-NodeInstalled {
    $nodeCheck = node --version 2>$null
    if ($null -eq $nodeCheck) {
        Write-Host "❌ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    return $true
}

function Show-Menu {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   CHOOSE AN OPTION                                         ║" -ForegroundColor Cyan
    Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║   1) Start development server (port 3000)                  ║" -ForegroundColor White
    Write-Host "║   2) Build for production                                  ║" -ForegroundColor White
    Write-Host "║   3) Serve built documentation                             ║" -ForegroundColor White
    Write-Host "║   4) Clear cache and rebuild                               ║" -ForegroundColor White
    Write-Host "║   5) Update dependencies                                   ║" -ForegroundColor White
    Write-Host "║   6) Exit                                                  ║" -ForegroundColor White
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Install-Dependencies {
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        Write-Host ""
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ npm install failed" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
        Write-Host ""
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✅ node_modules already exists" -ForegroundColor Green
        Write-Host ""
        $reinstall = Read-Host "Do you want to reinstall dependencies? (y/n)"
        if ($reinstall -eq "y" -or $reinstall -eq "Y") {
            Write-Host ""
            Write-Host "📦 Reinstalling dependencies..." -ForegroundColor Yellow
            npm install
        }
    }
}

# ============================================
# Main Script
# ============================================

Write-Header

# Show versions
Write-Host "✅ Node.js found: $(node --version)" -ForegroundColor Green
Write-Host "✅ npm found: $(npm --version)" -ForegroundColor Green
Write-Host ""

# Check Node.js installation
Check-NodeInstalled

# Install dependencies if needed
Install-Dependencies

# Main loop
while ($true) {
    Show-Menu

    $choice = Read-Host "Choose option (1-6)"

    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
            Write-Host "📖 Documentation will open at: http://localhost:3000" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
            Write-Host ""
            npm run start
        }
        "2" {
            Write-Host ""
            Write-Host "🏗️  Building documentation..." -ForegroundColor Yellow
            npm run build
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Build complete! Output in ./build/" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "❌ Build failed" -ForegroundColor Red
            }
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
        "3" {
            Write-Host ""
            if (-not (Test-Path "build")) {
                Write-Host "🏗️  Building documentation..." -ForegroundColor Yellow
                npm run build
            }
            Write-Host ""
            Write-Host "🌐 Serving documentation..." -ForegroundColor Yellow
            Write-Host "📖 Open: http://localhost:3000" -ForegroundColor Cyan
            Write-Host ""
            npm run serve
        }
        "4" {
            Write-Host ""
            Write-Host "🗑️  Clearing cache..." -ForegroundColor Yellow
            npm run clear
            Write-Host ""
            Write-Host "🏗️  Rebuilding..." -ForegroundColor Yellow
            npm run build
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Cache cleared and rebuilt!" -ForegroundColor Green
            }
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
        "5" {
            Write-Host ""
            Write-Host "📦 Updating dependencies..." -ForegroundColor Yellow
            npm update
            Write-Host ""
            Write-Host "✅ Dependencies updated" -ForegroundColor Green
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
        "6" {
            Write-Host ""
            Write-Host "👋 Goodbye!" -ForegroundColor Cyan
            exit 0
        }
        default {
            Write-Host ""
            Write-Host "❌ Invalid choice. Please select 1-6" -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
}
