#!/bin/bash

# ============================================================
# SchoolTrack Backend - Setup Script
# ============================================================
# Este script automatiza la instalación y configuración
# ============================================================

set -e

echo "╔════════════════════════════════════════╗"
echo "║  SchoolTrack Backend - Setup Script    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# 1. Verificar requisitos
echo "Verificando requisitos..."

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi
print_success "Node.js: $(node --version)"

if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi
print_success "npm: $(npm --version)"

if ! command -v mongod &> /dev/null && ! command -v mongo &> /dev/null; then
    print_info "MongoDB no está instalado globalmente (puede usar Docker)"
fi

# 2. Crear archivo .env si no existe
echo ""
echo "Configurando variables de entorno..."

if [ ! -f ".env" ]; then
    cp env.example .env
    print_success "Archivo .env creado"
    print_info "⚠️  Recuerda editar .env con tus valores"
else
    print_info ".env ya existe"
fi

# 3. Instalar dependencias
echo ""
echo "Instalando dependencias..."

if [ -d "node_modules" ]; then
    print_info "node_modules ya existen"
else
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencias instaladas"
    else
        print_error "Error instalando dependencias"
        exit 1
    fi
fi

# 4. Crear directorios necesarios
echo ""
echo "Creando directorios necesarios..."

mkdir -p uploads/{photos,documents,profiles,reports}
mkdir -p logs

print_success "Directorios creados"

# 5. Verificar MongoDB
echo ""
echo "Verificando MongoDB..."

# Intentar conectar a MongoDB local
if mongosh --eval "db.version()" > /dev/null 2>&1 2>/dev/null; then
    print_success "MongoDB local está disponible"
else
    print_info "MongoDB local no disponible. Opciones:"
    print_info "  1. Instala MongoDB: https://www.mongodb.com/try/download/community"
    print_info "  2. Usa Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
    print_info "  3. Usa MongoDB Atlas (nube)"
fi

# 6. Crear índices (opcional)
echo ""
echo "¿Deseas crear los índices de base de datos? (s/n)"
read -r create_indexes

if [ "$create_indexes" == "s" ] || [ "$create_indexes" == "yes" ]; then
    npm run create-indexes 2>/dev/null || print_info "Puedes crear índices después con: npm run create-indexes"
fi

# 7. Resumen final
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  ✓ Setup completado exitosamente      ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Edita tu .env con valores reales:"
echo "   nano .env"
echo ""
echo "2. Asegúrate que MongoDB está corriendo:"
echo "   mongod (en otra terminal)"
echo ""
echo "3. Inicia el servidor:"
echo "   npm run dev"
echo ""
echo "4. El servidor estará disponible en:"
echo "   http://localhost:3000"
echo ""
echo "Documentación útil:"
echo "  - Setup Guide: SETUP_GUIDE.md"
echo "  - Improvements: IMPROVEMENTS.md"
echo "  - Enhancement Summary: ENHANCEMENT_SUMMARY.md"
echo ""
