# 🚀 SchoolTrack Backend - Guía Completa

Sistema de seguimiento y gestión de transporte escolar con autenticación segura, gestión de archivos y sesiones.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Seguridad](#seguridad)
- [Solución de Problemas](#solución-de-problemas)

---

## ✨ Características

✅ **Autenticación JWT** - Seguridad basada en tokens  
✅ **Gestor de Sesiones** - Manejo de sesiones HTTP seguras  
✅ **Upload de Archivos** - Sistema de carga con Multer  
✅ **Control de Acceso** - Autenticación y autorización por rol  
✅ **Validación de Datos** - Validaciones en múltiples niveles  
✅ **Manejo de Errores** - Sistema global de errores  
✅ **WebSocket Real-time** - Actualizaciones en tiempo real  
✅ **Logging** - Auditoría de actividades  
✅ **Modelos Mejorados** - Esquemas Mongoose optimizados  

---

## 🔧 Requisitos

- **Node.js** v18+ ([Descargar](https://nodejs.org/))
- **MongoDB** v5+ ([Descargar](https://www.mongodb.com/))
- **npm** o **yarn**
- **Git**

### Verificar instalación:
```bash
node --version    # v18.x.x o superior
npm --version     # v9.x.x o superior
mongod --version  # v5.x.x o superior
```

---

## 📦 Instalación

### 1. Clonar el repositorio
```bash
cd schooltrack/backend
```

### 2. Instalar dependencias
```bash
npm install
```

Si tienes problemas, intenta:
```bash
npm install --legacy-peer-deps
npm audit fix
```

### 3. Crear archivo `.env`
```bash
cp env.example .env
```

---

## ⚙️ Configuración

### Archivo `.env`

Edita `backend/.env` con tus valores:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/schooltrack

# JWT
JWT_SECRET=tu_secreto_muy_seguro_cambiar_en_produccion
JWT_EXPIRE=7d

# Sesiones
SECRET_SESSION=tu_secreto_de_sesion_muy_seguro

# URLs
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:3000

# Servicios externos
MAPTILER_API_KEY=tu_api_key
GRAPHHOPPER_API_KEY=tu_api_key

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

### MongoDB Local

Asegurate de que MongoDB esté ejecutándose:

**Windows (cmd):**
```bash
mongod
```

**Mac/Linux:**
```bash
brew services start mongodb-community
# o
mongod
```

**Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## 🚀 Uso

### Desarrollo (con reinicio automático)
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Crear índices en base de datos
```bash
npm run create-indexes
```

### Seed (datos de prueba)
```bash
npm run seed
```

### Linting
```bash
npm run lint
```

### Testing
```bash
npm test
```

---

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/register        - Registrar nuevo usuario
POST   /api/auth/login           - Iniciar sesión
POST   /api/auth/refresh-token   - Refrescar token
POST   /api/auth/logout          - Cerrar sesión
GET    /api/auth/me              - Obtener usuario actual
```

### Sesiones
```
GET    /api/sessions/current     - Sesión actual
POST   /api/sessions/create      - Crear sesión
PUT    /api/sessions/update      - Actualizar sesión
POST   /api/sessions/visit       - Registrar visita
POST   /api/sessions/logout      - Cerrar sesión
```

### Archivos
```
POST   /api/files/upload/single        - Subir archivo único
POST   /api/files/upload/multiple      - Subir múltiples archivos
POST   /api/files/upload/mixed         - Subir diferentes tipos
GET    /api/files/download/:type/:file - Descargar archivo
DELETE /api/files/delete/:type/:file   - Eliminar archivo
GET    /api/files/list/:type           - Listar archivos
```

### Estudiantes
```
GET    /api/students              - Listar estudiantes
POST   /api/students              - Crear estudiante
GET    /api/students/:id          - Obtener estudiante
PUT    /api/students/:id          - Actualizar estudiante
DELETE /api/students/:id          - Eliminar estudiante
```

### Vehículos
```
GET    /api/vehicles              - Listar vehículos
POST   /api/vehicles              - Crear vehículo
GET    /api/vehicles/:id          - Obtener vehículo
PUT    /api/vehicles/:id          - Actualizar vehículo
DELETE /api/vehicles/:id          - Eliminar vehículo
```

### Rutas
```
GET    /api/routes                - Listar rutas
POST   /api/routes                - Crear ruta
GET    /api/routes/:id            - Obtener ruta
PUT    /api/routes/:id            - Actualizar ruta
DELETE /api/routes/:id            - Eliminar ruta
```

### Ubicaciones (Real-time)
```
POST   /api/locations             - Crear ubicación
GET    /api/locations             - Listar ubicaciones
GET    /api/locations/vehicle/:id - Ubicación de vehículo
```

### Paradas
```
GET    /api/stops                 - Listar paradas
POST   /api/stops                 - Crear parada
GET    /api/stops/:id             - Obtener parada
PUT    /api/stops/:id             - Actualizar parada
```

### Códigos QR
```
POST   /api/qr/generate           - Generar QR
GET    /api/qr/scan               - Escanear QR
```

---

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── server.js                 # Punto de entrada
│   ├── config/
│   │   └── db.js                 # Conexión MongoDB
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── vehicleController.js
│   │   ├── fileController.js     # NUEVO
│   │   └── sessionController.js  # NUEVO
│   ├── middleware/
│   │   ├── authMiddleware.js     # Mejorado
│   │   ├── sessionMiddleware.js  # NUEVO
│   │   ├── fileUploadMiddleware.js # NUEVO
│   │   ├── validate.js           # Mejorado
│   │   └── errorHandler.js       # NUEVO
│   ├── models/
│   │   ├── User.js               # Mejorado
│   │   ├── Student.js            # Mejorado
│   │   ├── Vehicle.js            # Mejorado
│   │   ├── Route.js
│   │   ├── Stop.js
│   │   └── Location.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── vehicles.js
│   │   ├── files.js              # NUEVO
│   │   ├── sessions.js           # NUEVO
│   │   └── ...
│   ├── services/
│   │   ├── geocodingService.js
│   │   ├── locationService.js
│   │   └── ...
│   └── utils/
│       └── helpers.js
├── uploads/                      # Carpeta de archivos
│   ├── photos/
│   ├── documents/
│   └── profiles/
├── .env                          # Variables de entorno
├── .env.example
├── package.json
└── README.md
```

---

## 🔐 Seguridad

### Mejores Prácticas Implementadas

1. **Autenticación JWT**
   - Tokens con expiración configurable
   - Refresh tokens para sesiones prolongadas
   - Verificación de usuario activo

2. **Sesiones Seguras**
   - HttpOnly cookies (protegidas contra XSS)
   - Secure flag en producción
   - Expiración automática

3. **Control de Acceso**
   - RBAC (Role-Based Access Control)
   - Verificación de propietario o admin
   - Permisos granulares

4. **Validación de Datos**
   - Validación de entrada en múltiples niveles
   - Sanitización de datos
   - Límites de tamaño

5. **Protección de Archivos**
   - Validación de rutas (path traversal prevention)
   - Tipos MIME controlados
   - Almacenamiento seguro

6. **Rate Limiting**
   - 200 solicitudes por 15 minutos
   - Proteción contra fuerza bruta

7. **Helmet.js**
   - Headers de seguridad HTTP
   - Protección contra ataques comunes

---

## 🐛 Solución de Problemas

### Error: "MONGODB_URI no está definida"
**Solución:**
```bash
# Agrega la variable en .env
MONGODB_URI=mongodb://localhost:27017/schooltrack
```

### Error: "Cannot connect to MongoDB"
**Solución:**
1. Verifica que MongoDB está corriendo
2. Comprueba la URI de conexión
3. Intenta conectar manualmente: `mongosh mongodb://localhost:27017`

### Error: "Port 3000 already in use"
**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>

# O usa otro puerto
PORT=3001 npm run dev
```

### Error: "Module not found"
**Solución:**
```bash
# Reinstala las dependencias
rm -rf node_modules package-lock.json
npm install
```

### Errores de validación
- Revisa el archivo `validate.js`
- Asegúrate de que los datos cumplan con los requerimientos
- Consulta los mensajes de error detallados

---

## 📊 Monitoreo

### Logs
Los logs se muestran en consola con Morgan:
- Development: Modo "dev" (colorido)
- Production: Modo "combined" (detallado)

### Base de Datos
Monitorea las conexiones:
```bash
# En mongosh
db.currentOp()
db.serverStatus()
```

### Performance
- Usa índices apropiados (ya configurados)
- Monitorea queries lentas
- Considera caché con Redis

---

## 🚀 Deployment

### Render.com (Recomendado)
1. Crea cuenta en [Render](https://render.com)
2. Conecta tu repositorio de GitHub
3. Crea nuevo "Web Service"
4. Configura variables de entorno:
   - `MONGODB_URI`: Tu URI de Atlas
   - `JWT_SECRET`: Tu secreto
   - `NODE_ENV`: production

### Heroku
```bash
heroku create schooltrack-api
heroku config:set MONGODB_URI=mongodb+srv://...
git push heroku main
```

### Railway
Similar a Render, muy fácil de usar.

---

## 📞 Soporte

Para problemas o preguntas:
- 📧 Email: support@schooltrack.com
- 💬 Discord: [Únete a nuestro servidor](https://discord.gg/schooltrack)
- 📖 Documentación: [Leer más](./IMPROVEMENTS.md)
- 🐛 Reportar bugs: [GitHub Issues](https://github.com/schooltrack/backend/issues)

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

**Última actualización:** Noviembre 2024
**Versión:** 1.0.0
