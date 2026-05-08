# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere al versionamiento semántico [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-05-08

### 🔥 Funcionalidades Añadidas (Features)
- **Gestión de Estado Centralizada:** Migración total de Vuex a Pinia en el Frontend para mejor reactividad, rendimiento y soporte de TypeScript/Composition API.
- **Doble Sistema de Tokens (JWT):** Implementación de una arquitectura de seguridad con `AccessToken` y `RefreshToken`. El token de refresco ahora se envía a través de una cookie estricta y cifrada (`HttpOnly`, `Secure`).
- **Autenticación Basada en Roles (RBAC):** Middleware avanzado (`authorize`) que controla y verifica dinámicamente los roles de los usuarios (padres vs administradores) a lo largo de toda la API.
- **Logística Geográfica Mejorada:** Modelos de Rutas (`Route`) reestructurados para integrar estructuras validas de **GeoJSON** preparadas para consultas geoespaciales con `2dsphere`.
- **Rastreo en Tiempo Real (WebSockets):** Integración completa con `Socket.IO` para emitir cambios de ubicación de transporte y estado en tiempo real.

### 🛡️ Seguridad y Robustez (Hardening)
- **Cifrado Fuerte:** Aumento en los rondas de sal de **bcrypt** (Salt Rounds = 12) incrementando exponencialmente la seguridad de contraseñas guardadas en la base de datos.
- **Centralización de Validaciones:** Migración masiva desde `express-validator` al uso estructurado e inmutable de **Joi Schemas** a través del middleware `validate.js`. 
- **Sistema de Logging (Winston):** Eliminación total de llamadas a `console.log/error` en entornos de producción, reemplazándolos con registros asíncronos y formateados a través de `winston`.
- **Protección HTTP:** Implementación de `Helmet` para prevenir vulnerabilidades web como inyección XSS y ataques de red.

### 🧪 Testing e Infraestructura
- **Integración con Jest + MongoDB Memory Server:** Creación de un entorno de pruebas E2E y de Integración estricto, efímero y ultra rápido en el backend (`npm test`).
- **Suites de Pruebas Completas:** Implementación de 53 casos de uso validando Controladores de Auth, Rutas, Vehículos, Estudiantes y flujos WebSocket.
- **Frontend Unit Testing:** Inyección de `@vue/cli-plugin-unit-jest` para garantizar la integridad visual e interactiva de los componentes principales (Ej. `StatusBadge`).
- **Factory App:** Aislamiento lógico de `appFactory.js` evitando que la instanciación de tests dispare servidores paralelos innecesarios de Express.

### 🐛 Corrección de Bugs
- Se corrigió un error en el Login (`authController`) donde se verificaba un booleano inexistente (`isActive`) bloqueando todo intento de ingreso. Se normalizó para usar `status: 'active'`.
- Se solucionó una caída crítica de MongoDB al instanciar nuevas Rutas (`routesController`) eliminando la estructura defectuosa de GeoJSON por defecto que rompía los índices `2dsphere`.
- Se corrigieron arrays anidados en el middleware `authorize` para roles de `Admin`.
- Eliminación de imports mal estructurados generadores de advertencias en ECMAScript Modules (`import/export`) bajo el entorno Jest.

### 🧹 Limpieza (Refactor & Chore)
- Borrado de código muerto (Dead Code), comentarios generados por IDEs y métodos obsoletos de pruebas UI de avatares.
- Mejoras de rendimiento en consultas con Mongoose integrando el uso estructurado de `.lean()` y `select()`.
- Unificación del estilo de código utilizando ESLint.

---

*(Versión inicial orientada a producción del proyecto unificado SchoolTrack).*
