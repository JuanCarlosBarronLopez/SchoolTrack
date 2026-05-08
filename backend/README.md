# SchoolTrack Backend

Sistema de seguimiento de transporte escolar - API REST con Node.js, MongoDB y WebSocket para tracking en tiempo real.

## Características

- ✅ API REST completa con autenticación JWT
- ✅ Integración con MongoDB para persistencia de datos
- ✅ WebSocket para tracking en tiempo real de vehículos
- ✅ Integración con servicios externos de mapas (GraphHopper, Nominatim)
- ✅ Sistema de roles y permisos (Admin, Conductor, Padre, Admin Escuela)
- ✅ Validación de datos y manejo de errores
- ✅ Documentación con Swagger (próximamente)

## Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Socket.IO** - Comunicación en tiempo real
- **JWT** - Autenticación
- **GraphHopper** - Cálculo de rutas y ETA
- **Nominatim** - Geocodificación
- **Redis** - Cache y sesiones (opcional)

## Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd schooltrack/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar MongoDB**
```bash
# Asegúrate de tener MongoDB instalado y ejecutándose
mongod
```

5. **Poblar base de datos con datos de prueba**
```bash
npm run seed
```

6. **Iniciar el servidor**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## Variables de Entorno

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/schooltrack

# JWT
JWT_SECRET=tu_secreto_jwt_muy_seguro
JWT_EXPIRE=7d

# Servicios externos
MAPTILER_API_KEY=tu_api_key_de_maptiler
GRAPHHOPPER_API_KEY=tu_api_key_de_graphhopper
NOMINATIM_API_URL=https://nominatim.openstreetmap.org

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# CORS
FRONTEND_URL=http://localhost:8080
```

## Estructura del Proyecto

```
src/
├── config/          # Configuraciones (DB, etc.)
├── controllers/     # Controladores de la API
├── middleware/      # Middleware personalizado
├── models/          # Modelos de MongoDB
├── routes/          # Rutas de la API
├── services/        # Servicios externos y lógica de negocio
├── utils/           # Utilidades y helpers
├── seeds/           # Datos de prueba
└── server.js        # Punto de entrada
```

## Uso de la API

### Autenticación

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@schooltrack.com",
  "password": "admin123"
}
```

**Registro**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nuevo Usuario",
  "email": "nuevo@email.com",
  "password": "password123",
  "role": "parent"
}
```

### Vehículos

**Obtener todos los vehículos**
```http
GET /api/vehicles
Authorization: Bearer <token>
```

**Crear vehículo**
```http
POST /api/vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "licensePlate": "XYZ789",
  "model": "Sprinter",
  "brand": "Mercedes-Benz",
  "year": 2021,
  "color": "Amarillo",
  "capacity": 20,
  "driver": "<driver_id>"
}
```

### Rutas

**Obtener todas las rutas**
```http
GET /api/routes
Authorization: Bearer <token>
```

**Crear ruta**
```http
POST /api/routes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nueva Ruta",
  "code": "NR001",
  "school": {
    "name": "Escuela Ejemplo",
    "address": "Calle Ejemplo 123",
    "coordinates": {
      "latitude": 19.4326,
      "longitude": -99.1332
    }
  }
}
```

### Tracking en Tiempo Real

El sistema utiliza Socket.IO para tracking en tiempo real. Los conductores pueden enviar sus ubicaciones y los usuarios pueden recibir actualizaciones en vivo.

**Eventos de Socket.IO:**

- `location-update` - Actualización de ubicación de vehículo
- `vehicle-location-update` - Broadcast de nueva ubicación
- `route-vehicle-update` - Actualización de vehículos en ruta

## Integración con Servicios Externos

### GraphHopper (Rutas y ETA)

El sistema utiliza GraphHopper para:
- Cálculo de rutas óptimas
- Estimación de tiempo de llegada (ETA)
- Distancia entre puntos

### Nominatim (Geocodificación)

Para convertir direcciones en coordenadas geográficas y viceversa.

## Seguridad

- Autenticación JWT
- Encriptación de contraseñas con bcrypt
- Validación de entrada de datos
- Rate limiting
- CORS configurado
- Validación de roles y permisos

## Roles y Permisos

- **Admin**: Acceso completo a todo el sistema
- **Driver**: Acceso a información de sus rutas y vehículos
- **Parent**: Acceso a información de sus hijos y rutas asignadas
- **School Admin**: Acceso a información de su escuela

## Próximas Mejoras

- [ ] Documentación Swagger/OpenAPI
- [ ] Tests automatizados
- [ ] Integración con notificaciones push
- [ ] Reportes y análisis de datos
- [ ] API de mensajería
- [ ] Integración con sistemas de pago

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Soporte

Para soporte, por favor contacta a: soporte@schooltrack.com