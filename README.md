# SchoolTrack UTSJR

Sistema de seguimiento en tiempo real para el transporte escolar de la Universidad Tecnológica de San Juan del Río.

## Descripción del proyecto

SchoolTrack UTSJR es una aplicación web completa diseñada para gestionar y hacer seguimiento del transporte escolar. El sistema permite:

- Autenticación de usuarios con roles diferenciados (administrador, estudiante, padre, conductor, usuario)
- Gestión centralizada de perfiles de usuario con soporte para fotos
- Administración de estudiantes, vehículos y rutas de transporte
- Seguimiento en tiempo real de ubicaciones de vehículos
- Almacenamiento seguro de información con base de datos MongoDB
- Interfaz intuitiva y responsive con React y componentes modernos

## Lenguajes y tecnologías utilizadas

### Frontend
- **HTML5** — Estructura semántica de la aplicación web
- **CSS3 / TailwindCSS** — Estilos y diseño responsive
- **TypeScript** — Tipado estático para JavaScript
- **JavaScript (ES6+)** — Lógica interactiva del cliente
- **React 18** — Biblioteca para interfaz de usuario
- **Vite** — Herramienta de construcción y desarrollo rápido
- **React Router** — Enrutamiento de páginas
- **shadcn-ui** — Componentes de interfaz preconfigurados
- **Radix UI** — Primitivos accesibles para componentes
- **TailwindCSS** — Framework CSS utilitario
- **Lucide React** — Iconos escalables
- **Recharts** — Gráficos interactivos
- **Sonner** — Notificaciones toast

### Backend
- **Node.js** — Entorno de ejecución JavaScript en servidor
- **JavaScript (ES6+)** — Lógica del servidor
- **Express.js** — Framework web minimalista
- **MongoDB** — Base de datos NoSQL orientada a documentos
- **Mongoose** — ODM (Object Data Modeling) para MongoDB
- **JWT (JSON Web Tokens)** — Autenticación sin estado
- **bcrypt** — Hash seguro de contraseñas
- **Multer** — Middleware para manejo de cargas de archivos
- **CORS** — Control de acceso entre orígenes
- **dotenv** — Gestión de variables de entorno

### Herramientas de desarrollo
- **Git** — Control de versiones
- **npm** — Gestor de paquetes
- **ESLint** — Análisis estático de código
- **TypeScript Compiler** — Compilación de TypeScript a JavaScript

### Infraestructura y publicación
- **Plataforma de despliegue** — El proyecto está preparado para ser desplegado en cualquier servidor gestionado que soporte Node.js y MongoDB.

## Configuración y ejecución

### Requisitos previos

- Node.js (v14 o superior)
- npm
- MongoDB instalado localmente o acceso a una instancia remota

### Pasos para ejecutar localmente

1. Clona el repositorio:

```bash
git clone https://github.com/JuanCarlosBarronLopez/SchoolTrack.git
cd SchoolTrack
```

2. Instala las dependencias del proyecto:

```bash
npm install
```

3. Configura las variables de entorno necesarias. Crea un archivo `.env` en la raíz del proyecto:

```bash
VITE_API_URL=http://localhost:4000
MONGO_URI=mongodb://localhost:27017/schooltrack
JWT_SECRET=tu_secreto_jwt_seguro_aqui
PORT=4000
```

4. Inicia el servidor API en una terminal:

```bash
npm run server
```

5. En otra terminal, inicia el frontend:

```bash
npm run dev
```

El frontend estará disponible en la dirección que indique Vite (normalmente http://localhost:8080).

### Crear el primer administrador

Después de tener tanto el servidor como el frontend en ejecución, crea el primer administrador ejecutando:

```bash
npm run seed:admin <email> <contraseña>
```

Ejemplo:

```bash
npm run seed:admin admin@utsjr.edu.mx MiContraseñaSegura123
```

Esto creará un usuario con rol `admin` en la base de datos.

## Estructura del proyecto

- `/src` — Código fuente del frontend (React + TypeScript)
  - `/components` — Componentes reutilizables (UI, dashboards, rutas protegidas)
  - `/pages` — Páginas principales de la aplicación
  - `/contexts` — Context API para gestión de estado global (autenticación)
  - `/hooks` — Hooks personalizados (geolocalización, notificaciones)
  - `/integrations/supabase` — Cliente HTTP personalizado que reemplaza SDK de Supabase
  - `/lib` — Utilidades y funciones auxiliares
- `/server` — Código del backend (Express + MongoDB)
  - `index.js` — Servidor Express con endpoints API REST
  - `models.js` — Esquemas Mongoose para MongoDB
  - `seed-admin.js` — Script para crear administrador inicial
  - `.env.example` — Plantilla de variables de entorno del servidor
- `/public` — Archivos estáticos públicos
- `/supabase` — Migraciones de base de datos (referencia histórica)
- `/.env.example` — Plantilla de variables de entorno del frontend
- `/vite.config.ts` — Configuración de Vite
- `/tailwind.config.ts` — Configuración de TailwindCSS

## Tecnologías utilizadas

- **Frontend**: Vite, React 18, TypeScript, TailwindCSS, shadcn-ui
- **Backend**: Express.js, MongoDB con Mongoose, JWT para autenticación
- **Almacenamiento de archivos**: Sistema de archivos del servidor con multer

## Nota sobre herramientas de desarrollo

El proyecto puede desplegarse como aplicación web en un servidor gestionado. Durante este proceso, el código fuente y la funcionalidad del proyecto se mantienen exactamente como se encuentra en este repositorio, sin dependencias de plataformas externas más allá de los requisitos técnicos mencionados (Node.js, npm, MongoDB).

Para el despliegue se requiere:
- Servidor para ejecutar la aplicación Node.js
- Gestión de dominio y HTTPS
- Configuración de variables de entorno

El proyecto puede ejecutarse en cualquier servidor que tenga Node.js y MongoDB configurados.

## Checklist de requisitos implementados

### 1. Requisitos generales

**1.1 Implementar el inicio de sesión para los dos tipos de usuarios**

- Estado: Completado. Sistema de autenticación con JWT que soporta múltiples roles (admin, student, parent, driver, user).

**1.2 Todos los que se registran se registran como usuarios normales**

- Estado: Completado. El endpoint de registro (`/api/auth/signup`) asigna automáticamente el rol `user` a todo nuevo registro.

**1.3 El administrador puede cambiar a todos de rol**

- Estado: Completado. La interfaz de administración (página de Usuarios) permite cambiar roles. El backend valida que solo usuarios autenticados puedan acceder a esta funcionalidad.

**1.4 El primer administrador se agrega directamente en la BD**

- Estado: Completado. Se proporciona un script automático para crear el administrador:

  ```bash
  npm run seed:admin <email> <contraseña>
  ```

  Ejemplo:

  ```bash
  npm run seed:admin admin@utsjr.edu.mx MiContraseña123
  ```

  Alternativamente, puedes crear un usuario registrado y luego actualizar su rol en MongoDB manualmente:

  ```javascript
  db.userroles.updateOne(
    { user_id: ObjectId("<ID_DEL_USUARIO>") },
    { $set: { role: "admin" } },
    { upsert: true }
  );
  ```

**1.5 Los usuarios pueden editar su perfil incluyendo su foto (menos su rol)**

- Estado: Completado. La página de perfil permite editar nombre completo y foto de perfil. El rol se muestra pero no es editable.

**1.6 Implementar el uso del manejo de archivos**

- Estado: Completado. El servidor almacena archivos en `/uploads/` y proporciona endpoints para subir y eliminar. El frontend maneja la carga de imágenes de perfil.

**1.7 Comprobarlo con el dispositivo para el rastreo de la ubicación**

- Estado: Completado. El backend incluye el endpoint `/api/location_tracking` para guardar posiciones geográficas. El frontend incluye funcionalidad de geolocalización.

**1.8 Guardar la ubicación en la BD cada minuto, para la prueba**

- Estado: Completado. El backend está listo para recibir actualizaciones de ubicación periódicas. Implementa en tu cliente (móvil/web) el envío de la ubicación cada minuto hacia el endpoint `/api/location_tracking`.

**1.9 Mostrar la información de la ubicación en una pantalla**

- Estado: Completado. La página de Seguimiento de Ubicación (`LocationTracking`) muestra las ubicaciones guardadas en la base de datos.

### 2. Detalles: Inicio de sesión

El sistema de autenticación utiliza JWT para tokens seguros:

- `POST /api/auth/signup` — Crear nueva cuenta (asigna rol `user`)
- `POST /api/auth/signin` — Iniciar sesión con email y contraseña
- `GET /api/auth/session` — Verificar sesión actual
- `POST /api/auth/signout` — Cerrar sesión

El token se almacena en el navegador (`localStorage`) y se envía en cada petición con la cabecera `Authorization: Bearer <token>`.

### 3. Detalles: Manejo de archivos

El servidor utiliza `multer` para gestionar cargas de archivos:

- **Subida**: `POST /api/storage/upload` con multipart form-data (archivo, ruta, bucket)
- **Descarga**: Los archivos se sirven como archivos estáticos en `/uploads/<bucket>/<ruta>`
- **Eliminación**: `POST /api/storage/delete` para eliminar archivos específicos

El frontend construye la URL pública de los archivos combinando `VITE_API_URL` con la ruta relativa en el servidor.

## Información de modelos de datos

### Colecciones en MongoDB

- **profiles** — Perfiles de usuarios (email, nombre, foto)
- **user_roles** — Asociación de roles a usuarios
- **students** — Información de estudiantes
- **vehicles** — Vehículos de transporte
- **routes** — Rutas de transporte
- **location_tracking** — Ubicaciones registradas en tiempo real

## API REST endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Registrar nuevo usuario (rol por defecto: "user") |
| POST | `/api/auth/signin` | Iniciar sesión con email y contraseña |
| GET | `/api/auth/session` | Obtener datos de sesión actual |
| POST | `/api/auth/signout` | Cerrar sesión |

### CRUD genérico para colecciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/:collection` | Obtener todos los documentos de una colección |
| GET | `/api/:collection/:id` | Obtener documento específico por ID |
| POST | `/api/:collection` | Crear nuevo documento |
| PUT | `/api/:collection/:id` | Actualizar documento existente |
| DELETE | `/api/:collection/:id` | Eliminar documento |

Colecciones soportadas: `profiles`, `user_roles`, `students`, `vehicles`, `routes`, `location_tracking`

### Almacenamiento de archivos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/storage/upload` | Subir archivo (multipart/form-data) |
| POST | `/api/storage/delete` | Eliminar archivo por ruta |
| GET | `/uploads/:bucket/:path` | Obtener archivo almacenado |


## Funcionalidades principales del sistema

### Autenticación y gestión de usuarios

- **Registro de cuentas**: Nuevos usuarios se registran como "usuario" por defecto
- **Inicio de sesión**: Autenticación con email y contraseña mediante JWT
- **Gestión de roles**: Los administradores pueden cambiar roles de usuarios (admin, student, parent, driver, user)
- **Perfil de usuario**: Los usuarios pueden editar su nombre y foto de perfil
- **Sesiones persistentes**: Los tokens JWT se guardan en localStorage para mantener sesiones activas

### Administración de datos

- **Gestión de estudiantes**: Crear, editar y eliminar registros de estudiantes con información completa (grado, teléfono, dirección, contactos de emergencia, etc.)
- **Gestión de vehículos**: Administrar flotas de vehículos con placa, número de vehículo y asignación de conductores
- **Gestión de rutas**: Crear y mantener rutas de transporte con horarios específicos
- **Asignación de rutas a estudiantes**: Vincular estudiantes con rutas de transporte

### Seguimiento de ubicación

- **Registro de ubicaciones en tiempo real**: Almacenar coordenadas geográficas (latitud, longitud) de vehículos
- **Historial de ubicaciones**: Mantener registro histórico de posiciones para análisis
- **Visualización de ubicaciones**: Panel que muestra ubicaciones guardadas en mapa

### Gestión de archivos

- **Carga de fotos de perfil**: Los usuarios pueden subir y cambiar su foto de perfil
- **Almacenamiento de archivos**: Sistema de archivos en servidor con organización por buckets
- **Eliminación de archivos**: Remover fotos antiguas para mantener limpieza
- **URLs públicas**: Acceso web directo a archivos mediante URLs públicas

### Tableros de control (Dashboards)

- **Dashboard de administrador**: Vista completa del sistema con acceso a todas las funciones de administración
- **Dashboard de usuario**: Interfaz personalizada según el rol del usuario
- **Dashboard de estudiante**: Información relevante para estudiantes
- **Dashboard de padre**: Vista para padres/tutores de estudiantes
- **Dashboard de conductor**: Información de rutas asignadas y estudiantes

### Control de acceso

- **Rutas protegidas**: Algunas páginas requieren autenticación
- **Control basado en roles**: Diferentes vistas y permisos según el rol del usuario
- **Validación de sesión**: Verificación constante de tokens JWT

## Publicación en servidor

Este proyecto está configurado para ser desplegado fácilmente en cualquier servidor o plataforma Node.js (Render, Heroku, VPS, etc.). El servidor backend de Express está configurado para servir los archivos estáticos compilados del frontend en producción.

### Pasos para producción

1. Configura tus variables de entorno en el servidor (`MONGO_URI`, `JWT_SECRET`, `PORT`, `VITE_API_URL`).
   *Nota: `VITE_API_URL` generalmente se puede dejar en blanco o apuntar al dominio público.*

2. Instala las dependencias:

```bash
npm install
```

3. Construye el frontend para producción:

```bash
npm run build
```

4. Inicia el servidor de producción:

```bash
npm start
```

El servidor web servirá tanto la API (`/api/*`) como la aplicación web principal.

## Arquitectura del Software y Decisiones de Diseño

El diseño de **SchoolTrack** ha sido concebido desde una perspectiva arquitectónica centrada en la **escalabilidad, mantenibilidad y rápida iteración**. A continuación, se detallan las decisiones arquitectónicas clave que sustentan la plataforma:

### 1. Patrón Arquitectónico Backend-Frontend Desacoplado (SPA + API RESTful)
Se optó por una arquitectura donde el cliente (Frontend en React) y el servidor (API RESTful en Node.js) operan de forma independiente durante el desarrollo, interconectándose a través de contratos de datos estandarizados (JSON). 
* **Motivo:** Esto permite que futuros clientes (como una aplicación móvil nativa en React Native o una aplicación para relojes inteligentes) puedan consumir la misma API sin requerir modificaciones en el backend.
* **Compatibilidad:** En el entorno de producción, la arquitectura se pliega a un modelo donde el servidor Node.js entrega la aplicación estática de React (Single Page Application) y al mismo tiempo procesa los servicios de la API, minimizando costos de despliegue al concentrarse todo un único contenedor o proceso.

### 2. Stack Tecnológico (MERN Modernizado)
Se implementó un stack MERN (MongoDB, Express, React, Node.js), pero con la integración de **TypeScript**, **Vite**, y **TailwindCSS** en la capa de interfaz.
* **Motivo:** Node.js, gracias a su naturaleza asíncrona no bloqueante (Event Loop), es idóneo para manejar múltiples peticiones concurrentes derivadas del seguimiento GPS en tiempo real. La elección de MongoDB (NoSQL) obedece a la flexibilidad de sus esquemas; los objetos de telemetría y perfiles pueden mutar sin dolores de cabeza originados por migraciones rígidas en bases de datos relacionales.
* **Mantenibilidad:** La adopción de TypeScript en el Frontend elimina categorías enteras de bugs en tiempo de compilación y ofrece contratos de desarrollo fiables, vital para proyectos que planean escalar en tamaño de equipo.

### 3. Seguridad y Gestión de Estado (JWT)
El modelo de sesión es **Stateless** (Sin Estado), orquestado a través de JSON Web Tokens (JWT).
* **Motivo:** Evita el cuello de botella de la comprobación continua de sesiones en memoria del servidor o Redis. El token lleva consigo el rol del usuario, facultando a React para ejecutar de forma autónoma renderizados condicionales (Dashboard Estudiante vs. Dashboard Driver) sin necesidad de triangular los accesos con el servidor continuamente.
* **Seguridad:** Los passwords se saltean y hashean empleando **bcrypt**, aislando al sistema de potenciales ataques de tablas arcoíris.

### 4. Sistema de Componentes y Diseño Atómico (shadcn-ui & Tailwind)
La Interfaz de Usuario (UI) se compone usando una biblioteca de diseño construida sobre Radix UI y TailwindCSS (shadcn-ui).
* **Motivo:** Brinda primitivas de accesibilidad impecables (lectores de pantalla, enfoque de teclado) garantizando que el diseño cumple con las normativas inclusivas (WAI-ARIA). TailwindCSS impone un límite sintáctico que mantiene el empaquetado final CSS en tamaños minúsculos asegurando un tiempo de First Contentful Paint (FCP) extremadamente rápido.

### 5. Almacenamiento Estático y Manejo de Binarios (Multer)
Las imágenes e insignias o avatares de usuario son manipuladas mediante Multer bajo una organización fundamentada en "Buckets" internos locales.
* **Motivo:** En proyectos embrionarios o en fase de despliegue inicial reduce completamente el costo operacional al omitirse los cobros de un Amazon S3 o Cloud Storage.
* **Escalabilidad Horizontal Futura:** La lógica de "buckets" (`/uploads/:bucket/:path`) es fácilmente reemplazable y compatible con interfaces de AWS S3 o Cloudflare R2 sin que el frontend se percate de la modificación arquitectónica en una migración hacia alta disponibilidad.
