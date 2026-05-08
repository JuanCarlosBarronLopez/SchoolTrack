# ============================================================
# SchoolTrack Backend - Setup Script for Windows
# ============================================================
# PowerShell script para automatizar la instalación

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SchoolTrack Backend - Setup (Windows) ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Funciones
function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

# 1. Verificar requisitos
Write-Host "Verificando requisitos..." -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version
    Print-Success "Node.js: $nodeVersion"
} catch {
    Print-Error "Node.js no está instalado"
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Print-Success "npm: $npmVersion"
} catch {
    Print-Error "npm no está instalado"
    exit 1
}

# Verificar MongoDB (opcional)
try {
    $mongoVersion = mongod --version
    Print-Success "MongoDB detectado"
} catch {
    Print-Info "MongoDB no está instalado globalmente (puedes usar Docker)"
}

# 2. Crear archivo .env si no existe
Write-Host ""
Write-Host "Configurando variables de entorno..." -ForegroundColor Cyan

if (-Not (Test-Path ".env")) {
    Copy-Item "env.example" ".env"
    Print-Success "Archivo .env creado"
    Print-Info "⚠️  Recuerda editar .env con tus valores"
} else {
    Print-Info ".env ya existe"
}

# 3. Instalar dependencias
Write-Host ""
Write-Host "Instalando dependencias..." -ForegroundColor Cyan

if (Test-Path "node_modules") {
    Print-Info "node_modules ya existen"
} else {
    Write-Host "Ejecutando: npm install" -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Dependencias instaladas"
    } else {
        Print-Error "Error instalando dependencias"
        exit 1
    }
}

# 4. Crear directorios necesarios
Write-Host ""
Write-Host "Creando directorios necesarios..." -ForegroundColor Cyan

$dirs = @(
    "uploads/photos",
    "uploads/documents",
    "uploads/profiles",
    "uploads/reports",
    "logs"
)

foreach ($dir in $dirs) {
    if (-Not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Print-Success "Directorios creados"

# 5. Verificar MongoDB
Write-Host ""
Write-Host "Verificando MongoDB..." -ForegroundColor Cyan

$mongoRunning = $false

try {
    $null = Test-Connection localhost -Port 27017 -Count 1 -ErrorAction SilentlyContinue
    if ($?) {
        Print-Success "MongoDB local está disponible"
        $mongoRunning = $true
    }
} catch {
    $mongoRunning = $false
}

if (-Not $mongoRunning) {
    Print-Info "MongoDB local no disponible. Opciones:"
    Print-Info "  1. Instala MongoDB: https://www.mongodb.com/try/download/community"
    Print-Info "  2. Usa Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
    Print-Info "  3. Usa MongoDB Atlas (nube)"
}

# 6. Menú de opciones
Write-Host ""
Write-Host "Opciones adicionales:" -ForegroundColor Cyan
Write-Host "  1. Crear índices de base de datos"
Write-Host "  2. Ver documentación"
Write-Host "  3. Salir"
Write-Host ""

$choice = Read-Host "Selecciona una opción (1-3)"

switch ($choice) {
    "1" {
        Write-Host "Creando índices..." -ForegroundColor Gray
        npm run create-indexes 2>$null
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Índices creados"
        } else {
            Print-Info "Puedes crear índices después con: npm run create-indexes"
        }
    }
    "2" {
        Write-Host ""
        Write-Host "Documentación disponible:" -ForegroundColor Green
        Write-Host "  - SETUP_GUIDE.md - Guía completa de instalación"
        Write-Host "  - IMPROVEMENTS.md - Detalles de mejoras"
        Write-Host "  - ENHANCEMENT_SUMMARY.md - Resumen de cambios"
        Write-Host ""
    }
    "3" {
        Write-Host "Saliendo..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Opción no válida" -ForegroundColor Red
    }
}

# 7. Resumen final
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✓ Setup completado exitosamente      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Próximos pasos:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Edita tu .env con valores reales:"
Write-Host "   notepad .env" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Asegúrate que MongoDB está corriendo:" -ForegroundColor Green
Write-Host "   mongod (en otra terminal o con Docker)" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Inicia el servidor:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "4. El servidor estará disponible en:" -ForegroundColor Green
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentación útil:" -ForegroundColor Green
Write-Host "  - Setup Guide: SETUP_GUIDE.md"
Write-Host "  - Improvements: IMPROVEMENTS.md"
Write-Host "  - Enhancement Summary: ENHANCEMENT_SUMMARY.md"
Write-Host ""

Write-Host "¡Listo! Para comenzar el desarrollo, ejecuta: npm run dev" -ForegroundColor Cyan
