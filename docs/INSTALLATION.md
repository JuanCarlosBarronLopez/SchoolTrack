# Guía de Instalación - SchoolTrack

Esta guía proporciona instrucciones detalladas para instalar y configurar SchoolTrack en diferentes entornos.

## 📋 Requisitos Previos

### Sistema Operativo
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 18.04+, CentOS 7+)

### Software Requerido
- **Node.js** 18.x o superior
- **MongoDB** 6.0 o superior
- **Git** 2.x o superior
- **Docker** y **Docker Compose** (opcional pero recomendado)

### Hardware Mínimo
- **RAM**: 4GB (8GB recomendado)
- **Espacio en disco**: 2GB disponibles
- **Procesador**: Dual-core 2.0GHz+

## 🚀 Métodos de Instalación

### Método 1: Docker (Recomendado ⭐)

La forma más rápida y sencilla de tener SchoolTrack funcionando.

#### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/schooltrack/schooltrack.git
cd schooltrack
```

#### Paso 2: Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus configuraciones
# Al menos debes configurar las API keys necesarias
```

#### Paso 3: Iniciar con Docker Compose
```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Verificar que todos los contenedores estén ejecutándose
docker-compose ps
```

#### Paso 4: Poblar Base de Datos
```bash
# Ejecutar script de semillas para datos de prueba
docker exec schooltrack-backend npm run seed
```

#### Paso 5: Acceder a la Aplicación
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
- **MongoDB**: localhost:27017

### Método 2: Instalación Manual

Para desarrolladores que prefieren más control sobre el entorno.

#### Backend (Node.js + MongoDB)

**Paso 1: Instalar Dependencias**
```bash
cd backend
npm install
```

**Paso 2: Configurar Variables de Entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

**Paso 3: Configurar MongoDB**
```bash
# Asegurarse de que MongoDB esté ejecutándose
mongod

# O con Docker
# docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

**Paso 4: Iniciar Servidor**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

#### Frontend (Vue.js)

**Paso 1: Instalar Dependencias**
```bash
cd frontend
npm install
```

**Paso 2: Configurar Variables de Entorno**
```bash
# Crear archivo .env en la raíz de frontend
echo "VUE_APP_API_URL=http://localhost:3000/api" > .env
echo "VUE_APP_SOCKET_URL=http://localhost:3000" >> .env
```

**Paso 3: Iniciar Servidor de Desarrollo**
```bash
npm run serve
```

### Método 3: Instalación con PM2 (Producción)

Para despliegues en producción con gestión de procesos.

#### Instalar PM2 Globalmente
```bash
npm install -g pm2
```

#### Backend con PM2
```bash
cd backend
npm install
npm run build

# Iniciar con PM2
pm2 start src/server.js --name schooltrack-backend
```

#### Frontend con PM2
```bash
cd frontend
npm install
npm run build

# Servir con PM2 y un servidor estático
pm2 start node_modules/@vue/cli-service/bin/vue-cli-service.js --name schooltrack-frontend -- serve --port 8080
```

## 🔧 Configuración de Variables de Entorno

### Variables Obligatorias

```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/schooltrack
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend (.env)
VUE_APP_API_URL=http://localhost:3000/api
VUE_APP_SOCKET_URL=http://localhost:3000
```

### API Keys Externas (Opcionales pero Recomendadas)

#### GraphHopper (Rutas y ETA)
1. Regístrate en https://graphhopper.com/
2. Obtén tu API key
3. Configura en backend/.env:
```bash
GRAPHHOPPER_API_KEY=your_graphhopper_api_key
```

#### MapTiler (Mapas)
1. Regístrate en https://www.maptiler.com/
2. Obtén tu API key
3. Configura en frontend/.env:
```bash
VUE_APP_MAPTILER_KEY=your_maptiler_api_key
```

## 📱 Credenciales de Prueba

Después de poblar la base de datos, puedes usar estas credenciales:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@schooltrack.com | admin123 |
| Conductor | juan.perez@schooltrack.com | driver123 |
| Padre | carlos.gonzalez@email.com | parent123 |

## 🐛 Solución de Problemas Comunes

### Error: "MongoDB no conecta"
```bash
# Verificar que MongoDB esté ejecutándose
sudo systemctl status mongod

# O con Docker
docker ps | grep mongo
```

### Error: "Puerto ya en uso"
```bash
# Verificar qué proceso está usando el puerto
lsof -i :3000  # Backend
lsof -i :8080  # Frontend
lsof -i :27017 # MongoDB
```

### Error: "CORS bloqueado"
```bash
# Verificar que FRONTEND_URL en backend/.env esté correcta
FRONTEND_URL=http://localhost:8080
```

### Error: "Mapas no cargan"
```bash
# Verificar API keys de mapas
# Backend: GRAPHHOPPER_API_KEY
# Frontend: VUE_APP_MAPTILER_KEY
```

## 🔒 Seguridad en Producción

### Backend
```bash
# Cambiar JWT_SECRET por una clave segura
JWT_SECRET=a_very_long_random_string_here

# Usar HTTPS
# Configurar certificados SSL
```

### Frontend
```bash
# Construir para producción
npm run build

# Los archivos estarán en dist/
```

### Docker en Producción
```bash
# Usar docker-compose.prod.yml
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📊 Monitoreo y Logs

### Docker Logs
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### PM2 (Producción)
```bash
# Ver procesos
pm2 list

# Ver logs
pm2 logs schooltrack-backend
pm2 logs schooltrack-frontend

# Monitoreo en tiempo real
pm2 monit
```

## 🚀 Optimización de Rendimiento

### Backend
```bash
# Habilitar compresión
npm install compression

# Usar Redis para sesiones
docker run -d -p 6379:6379 redis:alpine
```

### Frontend
```bash
# Analizar bundle size
npm install --save-dev webpack-bundle-analyzer

# Optimizar imágenes
npm install --save-dev imagemin-webpack-plugin
```

## 🔄 Actualización

### Con Docker
```bash
# Detener servicios
docker-compose down

# Actualizar código
git pull origin main

# Reconstruir imágenes
docker-compose build --no-cache

# Reiniciar
docker-compose up -d
```

### Manual
```bash
# Backend
cd backend
git pull origin main
npm install
npm run build

# Frontend
cd ../frontend
git pull origin main
npm install
npm run build
```

## 📚 Recursos Adicionales

- [Documentación Backend](./backend/README.md)
- [Documentación Frontend](./frontend/README.md)
- [API Reference](./docs/API.md)
- [Guía de Usuario](./docs/USER_GUIDE.md)

## 🆘 Soporte

Si encuentras problemas durante la instalación:

1. **Verifica los requisitos previos**
2. **Revisa los logs de error**
3. **Consulta la sección de solución de problemas**
4. **Abre un issue en GitHub**

Para soporte técnico: soporte@schooltrack.com

---

¡Disfruta usando SchoolTrack! 🚌✨