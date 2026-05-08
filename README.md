<div align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" alt="Vue.js" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</div>

<h1 align="center">🚌 SchoolTrack</h1>

<p align="center">
  <strong>Plataforma integral, segura y en tiempo real para el seguimiento de transporte escolar.</strong>
  <br>
  <em>Diseñada para brindar tranquilidad a los padres y eficiencia operativa a las instituciones.</em>
</p>

<p align="center">
  <a href="#-características-principales">Características</a> •
  <a href="#-arquitectura-y-stack-tecnológico">Arquitectura</a> •
  <a href="#-instalación-y-configuración">Instalación</a> •
  <a href="#-entorno-de-pruebas">Pruebas</a> •
  <a href="#-despliegue-producción">Despliegue</a>
</p>

---

## 🌟 Acerca del Proyecto

**SchoolTrack** resuelve la incertidumbre logística durante los traslados escolares. Mediante una arquitectura robusta orientada a eventos y un backend altamente asegurado, la aplicación permite a las escuelas gestionar su flotilla, asignar rutas geolocalizadas y brindar a los tutores una visualización satelital en **tiempo real** del paradero exacto de sus hijos.

El proyecto está diseñado bajo estándares de **código limpio**, **arquitectura escalable** (Node.js/Express) e interfaces reactivas y modernas empleando **Vue 3** y **Pinia**. 

---

## 🚀 Características Principales

### Para Administradores (Escuelas)
- 📊 **Dashboard Analítico:** Panel de control con métricas en tiempo real, conteos de asistencia y estados de flotilla.
- 🗺️ **Gestión Geoespacial (GraphHopper & Nominatim):** Creación de rutas óptimas con validación de puntos (polígonos GeoJSON), paradas inteligentes y asignación dinámica.
- 👥 **Gestión de Entidades:** CRUD integral para Alumnos, Tutores (Padres), Vehículos y Conductores. Control de roles mediante middleware RBAC (Role-Based Access Control).

### Para Tutores (Padres)
- 📍 **Live Tracking (Socket.IO & Leaflet):** Seguimiento del autobús escolar en el mapa en riguroso tiempo real con latencia de milisegundos.
- 📱 **QRs Inteligentes:** Generación automática de códigos QR únicos por estudiante para un pase de lista automatizado e inviolable.
- 🔔 **Notificaciones Push:** Avisos instantáneos cuando el estudiante aborda, desciende o hay retrasos en el tráfico.

### Seguridad y Rendimiento
- 🔐 **Dual-Token System:** Autenticación a través de JSON Web Tokens (Access Tokens de corta vida y Refresh Tokens alojados en cookies `HttpOnly` y `Secure`).
- 🛡️ **Defensa Perimetral:** Validación rigurosa de Data Transfer Objects usando **Joi Schemas** y protección HTTP mediante **Helmet**.
- ⚡ **Rendimiento Optimo:** Cifrado asíncrono con bcrypt (12 rounds) y sanitización contra inyecciones NoSQL.

---

## 🛠 Arquitectura y Stack Tecnológico

El ecosistema está dividido en dos microservicios principales para facilitar la escalabilidad horizontal:

| Categoría | Tecnología Utilizada | Propósito en el proyecto |
| --- | --- | --- |
| **Frontend** | Vue 3 (Composition API) | Construcción de interfaces reactivas y modulares |
| **Gestión de Estado** | Pinia | Almacenamiento centralizado rápido y tipable |
| **Backend** | Node.js + Express | Servidor RESTful asíncrono de alto rendimiento |
| **Base de Datos** | MongoDB (Mongoose) | Persistencia de datos, soporte nativo GeoJSON `2dsphere` |
| **Tiempo Real** | Socket.IO | Emisión bidireccional de coordenadas GPS y eventos |
| **Mapas & Ruteo** | Leaflet + GraphHopper | Renderizado cartográfico y cálculo de rutas óptimas |
| **Testing** | Jest + Supertest + Vue Test Utils | Pruebas unitarias y de integración end-to-end |
| **Infraestructura** | Docker / Render | Contenerización y Despliegue en la nube |

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para levantar un entorno de desarrollo local completo.

### 1. Clonar Repositorio
```bash
git clone https://github.com/TU-USUARIO/SchoolTrack.git
cd SchoolTrack
```

### 2. Configuración del Backend
```bash
cd backend
npm install
cp .env.example .env
```
Abre el archivo `.env` e inserta tus credenciales, incluyendo la conexión a MongoDB:
```ini
NODE_ENV=development
PORT=10000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/schooltrack
JWT_SECRET=tu_secreto_super_seguro
JWT_REFRESH_SECRET=tu_secreto_de_refresco
```
Levanta el servidor:
```bash
npm run dev
```

### 3. Configuración del Frontend
En una nueva terminal:
```bash
cd frontend
npm install
cp .env.example .env
```
Abre el `.env` del frontend:
```ini
VUE_APP_API_URL=http://localhost:10000/api
VUE_APP_WS_URL=http://localhost:10000
```
Inicia el entorno reactivo:
```bash
npm run serve
```
El proyecto estará vivo en `http://localhost:8080`.

---

## 🧪 Entorno de Pruebas

SchoolTrack está asegurado mediante un sistema de Integración Continua agresivo con una amplia cobertura. Las pruebas levantan un **MongoDB Memory Server** volátil, lo que significa que puedes ejecutar la suite sin temor a borrar o afectar tu base de datos de desarrollo.

### Ejecutar Suite Completa (Backend)
```bash
cd backend
npm test
```
*Valida: Controladores Auth, Estudiantes, Vehículos, Rutas y Flujos WebSockets.*

### Ejecutar Suite UI (Frontend)
```bash
cd frontend
npm run test:unit
```
*Valida: Renderizado de componentes DOM interactivos y hooks de Vue.*

---

## 🐳 Despliegue Producción (Docker)

SchoolTrack está "Dockerizado" listo para ser enviado a cualquier clúster, VPS o servicio Cloud (como Render o AWS ECS).

Construye y levanta todo el stack (Backend + Frontend) con un solo comando:

```bash
docker-compose up -d --build
```

*(Asegúrate de haber inyectado correctamente el `.env` de producción para prevenir fallos de conexión hacia la BD).*

---

## 🤝 Contribuyendo

¡Las contribuciones hacen a la comunidad open source un lugar increíble! Si deseas mejorar este proyecto:

1. Lee detalladamente nuestra [Guía de Contribución](CONTRIBUTING.md).
2. Revisa el historial de progresos en el [Changelog](CHANGELOG.md).
3. Haz un Fork y envía tu **Pull Request**.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para obtener todos los detalles.

---
*Hecho con 🩵 y mucho código.*
