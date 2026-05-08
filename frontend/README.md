# SchoolTrack Frontend

Aplicación web de SchoolTrack - Sistema de seguimiento de transporte escolar, construida con Vue.js 3 y integración de mapas con Leaflet.

## Características

- ✅ Interfaz moderna y responsive
- ✅ Dashboard en tiempo real
- ✅ Visualización de mapas interactivos
- ✅ Tracking en vivo de vehículos
- ✅ Gestión completa CRUD
- ✅ Sistema de autenticación
- ✅ Notificaciones en tiempo real
- ✅ Diseño adaptativo para móviles

## Tecnologías

- **Vue.js 3** - Framework progresivo de JavaScript
- **Vue Router 4** - Sistema de rutas
- **Vuex 4** - Gestión de estado
- **Leaflet** - Biblioteca de mapas interactivos
- **Bootstrap 5** - Framework CSS
- **Socket.IO Client** - Comunicación en tiempo real
- **Axios** - Cliente HTTP
- **Chart.js** - Gráficos y visualizaciones

## Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd schooltrack/frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con la URL del backend
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run serve
```

5. **Construir para producción**
```bash
npm run build
```

## Variables de Entorno

```env
VUE_APP_API_URL=http://localhost:3000/api
VUE_APP_MAPTILER_KEY=tu_api_key_de_maptiler
VUE_APP_SOCKET_URL=http://localhost:3000
```

## Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes Vue reutilizables
│   ├── common/      # Componentes comunes
│   ├── layout/      # Componentes de layout
│   ├── maps/        # Componentes de mapas
│   └── [modules]/   # Componentes por módulo
├── router/          # Configuración de rutas
├── services/        # Servicios y API
├── store/           # Vuex store modules
├── utils/           # Utilidades y helpers
└── views/           # Vistas principales
```

## Componentes Principales

### Layout
- **Sidebar** - Navegación lateral
- **Navbar** - Barra de navegación superior

### Common
- **LoadingSpinner** - Indicador de carga
- **StatusBadge** - Badge de estado dinámico
- **Modal** - Modal reutilizable

### Maps
- **MapView** - Componente principal de mapas
- **VehicleMarker** - Marcador de vehículo
- **StopMarker** - Marcador de parada

### Vistas
- **Dashboard** - Panel principal
- **MapView** - Vista de mapa en vivo
- **Tracking** - Seguimiento en tiempo real
- **Vehicles** - Gestión de vehículos
- **Routes** - Gestión de rutas
- **Stops** - Gestión de paradas
- **Users** - Gestión de usuarios

## Uso

### Desarrollo Local

1. Asegúrate de que el backend esté ejecutándose
2. Inicia el servidor de desarrollo:
```bash
npm run serve
```
3. Abre http://localhost:8080 en tu navegador

### Credenciales de Prueba

- **Admin**: admin@schooltrack.com / admin123
- **Driver**: juan.perez@schooltrack.com / driver123
- **Parent**: carlos.gonzalez@email.com / parent123

## Características de Mapas

### Integración Leaflet

El sistema utiliza Leaflet.js para proporcionar:
- Visualización de mapas interactivos
- Marcadores personalizados para vehículos y paradas
- Líneas de ruta con colores diferenciados
- Popups informativos
- Controles de navegación

### Capas de Información

- **Vehículos**: Ubicación en tiempo real con estado
- **Paradas**: Puntos de recogida y entrega
- **Rutas**: Trayectos optimizados
- **Áreas**: Zonas de servicio

### Funcionalidades

1. **Zoom y Pan**: Navegación intuitiva
2. **Centrado Automático**: En vehículos o rutas
3. **Filtros por Capa**: Mostrar/ocultar elementos
4. **Leyenda Interactiva**: Identificación visual
5. **Búsqueda de Ubicaciones**: Geocodificación

## Sistema de Notificaciones

El frontend incluye un sistema de notificaciones que muestra:
- Actualizaciones de ubicación de vehículos
- Cambios de estado de rutas
- Alertas importantes
- Mensajes del sistema

## Diseño Responsivo

La aplicación está completamente optimizada para:
- **Desktop**: Experiencia completa con sidebar
- **Tablet**: Adaptación de layout
- **Mobile**: Menú desplegable y controles táctiles

## Rendimiento

Optimizaciones implementadas:
- Lazy loading de componentes
- Caché de peticiones API
- Comprobación de tipos en runtime
- Optimización de imágenes
- Code splitting por rutas

## Seguridad

- Validación de entrada de datos
- Protección de rutas con autenticación
- Manejo seguro de tokens JWT
- Prevención de XSS
- HTTPS en producción

## Internacionalización

Preparado para múltiples idiomas:
- Textos centralizados
- Formatos de fecha/hora localizados
- Monedas y números localizados

## Pruebas

```bash
# Ejecutar pruebas unitarias
npm run test:unit

# Ejecutar pruebas de integración
npm run test:e2e

# Pruebas con coverage
npm run test:coverage
```

## Despliegue

### Producción

1. Construir la aplicación:
```bash
npm run build
```

2. Los archivos generados estarán en `dist/`

3. Servir con un servidor web estático

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 80
CMD ["npm", "run", "serve"]
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Scripts Disponibles

```bash
# Desarrollo
npm run serve      # Servidor de desarrollo
npm run build      # Construir para producción
npm run lint       # Linting
npm run test:unit  # Pruebas unitarias

# Mantenimiento
npm run audit      # Auditoría de seguridad
npm run update     # Actualizar dependencias
```

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Soporte

Para soporte, por favor contacta a: soporte@schooltrack.com

## Demo

Puedes ver una demo en vivo en: https://schooltrack-demo.com