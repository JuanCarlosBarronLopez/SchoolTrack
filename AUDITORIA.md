# 🔍 AUDITORÍA COMPLETA — SchoolTrack

> Fecha: 2026-05-08  
> Versión analizada: 1.0.0  
> Auditor: Antigravity AI  

---

## 📋 Resumen Ejecutivo

SchoolTrack es un proyecto funcional con una buena base arquitectónica, pero presenta **inconsistencias críticas** que lo alejan del nivel portfolio profesional. Los problemas más graves son: mezcla de sistemas de módulos (CommonJS/ESM), hardcodeo de secretos como fallback, ausencia casi total de tests, carpeta duplicada del frontend, y ~50+ `console.log` en producción sin logger profesional (winston existe pero no se usa).

---

## 📁 PASO 0.1 — Estructura de Carpetas

### Raíz del proyecto

| Archivo/Carpeta | Estado | Notas |
|---|---|---|
| `package.json` | ✅ Bueno | Monorepo con scripts de orquestación |
| `docker-compose.yml` | ⚠️ Regular | Sin healthchecks, secrets hardcoded |
| `.gitignore` | ✅ Bueno | Cubre node_modules, .env, logs, coverage |
| `env.example` | ✅ Bueno | Completo pero falta `.env.example` (nombre estándar) |
| `README.md` | ❌ Malo | Describe un proyecto **React+TypeScript+Vite+TailwindCSS** que NO coincide con el código real (Vue 3 + Bootstrap). Totalmente desincronizado |
| `docs/` | ⚠️ Regular | Solo contiene `INSTALLATION.md` |
| `schooltrack-frontend-new/` | ❌ Malo | **Carpeta duplicada del frontend** — Copia casi idéntica sin uso. Debe eliminarse |

### Backend (`/backend`)

| Archivo/Carpeta | Estado | Notas |
|---|---|---|
| `src/config/db.js` | ✅ Bueno | Conexión con fallback graceful |
| `src/db.js` | ❌ Duplicado | Versión antigua con CommonJS (`require`). Debe eliminarse |
| `src/server.js` | ⚠️ Regular | Mezcla entry point con configuración de app |
| `src/controllers/` | ✅ Bueno | 9 controllers bien organizados |
| `src/middleware/` | ✅ Bueno | 6 middlewares (auth, error, security, validate, upload, session) |
| `src/models/` | ✅ Bueno | 10 modelos Mongoose robustos |
| `src/routes/` | ⚠️ Regular | 14 archivos de rutas, pero usan `require()` (CommonJS) |
| `src/services/` | ⚠️ Regular | 4 servicios, pero usan `require()` (CommonJS) |
| `src/utils/helpers.js` | ⚠️ Regular | Usa `module.exports` (CommonJS) |
| `src/scrips/` | ❌ Malo | Typo en nombre: "scrips" → debería ser "scripts" |
| `src/seeds/` | ✅ Bueno | Datos seed completos con seedData.js |
| `tests/` | ❌ Malo | Solo 1 test (avatar-e2e) — cobertura ≈ 1% |
| `scripts/verify-avatars.js` | ⚠️ Regular | Script de verificación útil pero fuera de src |
| `Dockerfile` | ✅ Bueno | Multi-stage, usuario no-root, healthcheck, dumb-init |
| `docker-compose.yml` | ✅ Bueno | Más completo que el de raíz (healthchecks, mongo-express) |
| Documentación MD extra | ⚠️ Regular | 7 archivos .md sueltos que deberían estar en `/docs` |

### Frontend (`/frontend`)

| Archivo/Carpeta | Estado | Notas |
|---|---|---|
| `src/App.vue` | ✅ Bueno | Componente raíz |
| `src/main.js` | ✅ Bueno | Entry point Vue 3 |
| `src/components/` | ✅ Bueno | Organizados en common, layout, maps, ui |
| `src/views/` | ✅ Bueno | Vistas por módulo (auth, vehicles, routes, stops, users) |
| `src/pages/Profile.vue` | ⚠️ Duplicado | Profile existe tanto en views/ como en pages/ |
| `src/router/index.js` | ⚠️ Regular | 6x console.log de depuración que deberían eliminarse |
| `src/store/` | ✅ Bueno | Vuex con módulos (auth, locations, routes, stops, users, vehicles) |
| `src/services/` | ✅ Bueno | API service con interceptors bien configurados |
| `Dockerfile` | ✅ Bueno | Multi-stage con nginx, healthcheck |
| `vue.config.js` | ⚠️ Regular | Hack para desactivar plugin copy (problema de webpack) |
| `.env.development` | ✅ Bueno | Variables de entorno de desarrollo |
| `.env.production` | ✅ Bueno | Variables de producción (Render) |
| `errores.txt` | ❌ Malo | Archivo de debug vacío/sin propósito |
| `create-missing-views.ps1` | ⚠️ Regular | Script de scaffolding que ya cumplió su propósito |
| `tests/` | ❌ No existe | No hay ningún test en el frontend |

---

## 📦 PASO 0.2 — Dependencias

### Backend (`package.json`)

#### Dependencias presentes ✅
| Paquete | Versión | Estado |
|---|---|---|
| express | ^4.18.2 | ✅ Correcto |
| mongoose | ^7.5.0 | ✅ Correcto |
| socket.io | ^4.7.2 | ✅ Correcto |
| jsonwebtoken | ^9.0.2 | ✅ Correcto |
| bcryptjs | ^2.4.3 | ✅ Correcto |
| helmet | ^7.0.0 | ✅ Presente y configurado |
| express-rate-limit | ^6.10.0 | ✅ Presente y configurado |
| cors | ^2.8.5 | ✅ Presente y configurado |
| dotenv | ^17.2.3 | ✅ Correcto |
| morgan | ^1.10.0 | ✅ Correcto |
| multer | ^1.4.5 | ✅ Correcto |
| express-validator | ^7.3.0 | ✅ Usado como validador |
| winston | ^3.11.0 | ⚠️ Instalado pero **NO se usa** en el código |

#### Dependencias faltantes críticas ❌
| Paquete | Propósito |
|---|---|
| `express-mongo-sanitize` | Prevenir inyección NoSQL (el custom middleware es débil) |
| `hpp` | Prevenir HTTP Parameter Pollution |
| `compression` | Compresión de respuestas |
| `supertest` | Tests de integración HTTP |
| `mongodb-memory-server` | Tests con BD en memoria |

#### Observaciones
- `redis` está como dependencia pero no se usa activamente en el código (solo en docker-compose)
- `node-schedule` está instalado pero no se usa
- `qrcode` está instalado y se usa ✅

### Frontend (`package.json`)

#### Dependencias presentes ✅
| Paquete | Versión | Estado |
|---|---|---|
| vue | ^3.3.4 | ✅ |
| vue-router | ^4.2.4 | ✅ |
| vuex | ^4.1.0 | ✅ (no Pinia, pero funcional) |
| axios | ^1.5.0 | ✅ |
| socket.io-client | ^4.7.2 | ✅ |
| leaflet | ^1.9.4 | ✅ |
| bootstrap | ^5.3.1 | ✅ |
| chart.js + vue-chartjs | ✅ | Para gráficas |

#### Dependencias faltantes
| Paquete | Propósito |
|---|---|
| `@vue/test-utils` | Tests unitarios |
| `vitest` o `jest` | Test runner |

---

## 🐳 PASO 0.3 — Docker

### docker-compose.yml (raíz)
| Aspecto | Estado | Detalle |
|---|---|---|
| Servicios | ⚠️ 4 servicios | MongoDB, Redis, Backend, Frontend |
| Healthchecks | ❌ Ausentes | Ningún servicio tiene healthcheck |
| Volúmenes MongoDB | ✅ Persistentes | `mongodb_data` |
| Secrets | ❌ Hardcoded | `admin123`, `your_super_secret_jwt_key_here` en texto plano |
| Versión | ⚠️ | `version: '3.8'` — obsoleto en Docker Compose v2+ |
| CORS | ⚠️ | Fallback a `'*'` en Socket.IO si no hay FRONTEND_URL |

### docker-compose.yml (backend)
| Aspecto | Estado | Detalle |
|---|---|---|
| Healthchecks | ✅ Presentes | Backend, MongoDB, Redis todos con healthcheck |
| Multi-stage | ✅ | Dockerfile del backend usa multi-stage |
| Logging | ✅ | JSON con rotación (10m, 3 archivos) |
| Secrets | ❌ Hardcoded | `schooltrack_secure_password`, `admin_express` |
| Mongo Express | ✅ | En perfil `dev` (buena práctica) |

### Dockerfiles
| Componente | Multi-stage | Non-root | Healthcheck | Dumb-init |
|---|---|---|---|---|
| Backend | ✅ | ✅ | ✅ | ✅ |
| Frontend | ✅ (nginx) | ⚠️ Falla* | ✅ | N/A |

> *El Dockerfile del frontend intenta crear un grupo `nginx` con GID 101, pero alpine ya tiene uno. Puede fallar.

---

## 🔒 PASO 0.4 — Seguridad

### Console.log en backend (producción)

| Ubicación | Cantidad | Severidad |
|---|---|---|
| `server.js` | 5 | ⚠️ Media |
| `notificationService.js` | 15 | ❌ Alta — Expone datos de usuario |
| `locationService.js` | 3 | ❌ Alta — Expone datos de conductor |
| `qrController.js` | 4 | ⚠️ Media |
| `seedData.js` | 20+ | ✅ Aceptable (solo seed) |
| `db.js` / `config/db.js` | 4 | ⚠️ Media |
| `scrips/*.js` | 4 | ✅ Aceptable (solo scripts) |
| **TOTAL runtime** | **~30** | ❌ **Debe usar winston** |

### Console.log en frontend (producción)

| Ubicación | Cantidad | Severidad |
|---|---|---|
| `router/index.js` | 6 | ❌ Alta — Logs de depuración |
| `services/api.js` | 5 | ⚠️ Media (protegidos por env check) |

### Secretos hardcodeados ❌

| Archivo | Hallazgo | Severidad |
|---|---|---|
| `authController.js:8` | `'changeme_in_prod'` como fallback JWT_SECRET | ❌ **CRÍTICO** |
| `authMiddleware.js:26` | `'changeme_in_prod'` como fallback JWT_SECRET | ❌ **CRÍTICO** |
| `server.js:137` | `'cookie-secret-key'` como fallback | ❌ Alta |
| `sessionMiddleware.js:11` | `'schooltrack-secret-key-2024-secure'` hardcoded | ❌ **CRÍTICO** |
| `docker-compose.yml (raíz):13` | `admin123` como password MongoDB | ❌ Alta |
| `docker-compose.yml (raíz):46` | `your_super_secret_jwt_key_here` | ❌ Alta |
| `docker-compose.yml (backend):48` | `schooltrack_secure_password` | ❌ Alta |
| `seeds/index.js:29,39,47` | Passwords en texto plano (`driver123`, `parent123`) | ⚠️ Media (solo seed) |

### Configuración de seguridad

| Aspecto | Estado | Detalle |
|---|---|---|
| Helmet | ✅ Configurado | CSP, HSTS, frameguard, referrer |
| Rate Limiting | ✅ Configurado | API general + auth estricto |
| CORS | ⚠️ Parcial | Lista hardcodeada de orígenes + fallback permisivo |
| NoSQL Injection | ⚠️ Débil | Middleware custom incompleto (no cubre `$set`, `$in`, etc.) |
| Input Sanitization | ⚠️ Básico | Solo trim(), no sanitiza HTML/XSS |
| Password Hashing | ⚠️ Salt 10 | Salt rounds = 10 (recomendado: 12+) |
| JWT Refresh Tokens | ❌ Ausente | Solo access token, sin refresh |
| v-html | ✅ No se usa | No hay riesgo XSS en frontend |
| .gitignore | ✅ Completo | Cubre .env, node_modules, logs |
| .env.example | ⚠️ Nombre | Existe como `env.example` (sin punto inicial) |

### Mezcla de módulos (ESM vs CommonJS) ❌ CRÍTICO

El backend tiene `"type": "module"` en package.json pero **más de 20 archivos** usan `require()`:

| Archivos con `require()` | Archivos con `import` |
|---|---|
| Todos los routes (14 archivos) | server.js, config/db.js |
| Todos los services (4 archivos) | middleware (6 archivos) |
| controllers/authController.js | controllers (8 otros archivos) |
| utils/helpers.js | models (10 archivos) |
| scrips/*.js (2 archivos) | |

> ⚠️ **Esto puede causar errores de ejecución** dependiendo de la versión de Node.

---

## 🧪 PASO 0.5 — Tests

| Componente | Archivos de test | Cobertura estimada |
|---|---|---|
| Backend | 1 (`avatar-e2e.test.js`) | ~1% |
| Frontend | 0 | 0% |

### Detalle

- **`backend/tests/avatar-e2e.test.js`**: Test end-to-end del sistema de avatares. Es un solo archivo de 11KB.
- **No hay**: tests de auth, CRUD, WebSocket, validaciones, ni middleware.
- **No hay**: configuración de Jest (`jest.config.js`) ni setup de test.
- **No hay**: directorio `tests/unit/` ni `tests/integration/`.
- **El script `"test": "jest"` existe** en package.json pero no hay configuración.

---

## 📄 PASO 0.6 — Documentación

### README.md (raíz)

| Aspecto | Estado | Detalle |
|---|---|---|
| Descripción | ❌ Incorrecta | Dice React+TypeScript+Vite+TailwindCSS+shadcn-ui (el código es Vue 3+Bootstrap) |
| Badges | ❌ Ausentes | Sin badges de tecnologías ni estado |
| Demo | ❌ Ausente | Sin enlace a demo ni video |
| Arquitectura | ❌ Incorrecta | Describe stack MERN cuando es MEVN |
| API docs | ⚠️ Parcial | Lista endpoints pero son del README de JuanCarlos (no de MAGNO9) |
| Setup instructions | ⚠️ Incorrectas | Instrucciones de proyecto React, no Vue |
| Checklist | ✅ Detallado | Checklist de requisitos implementados (pero para proyecto equivocado) |

### Otros documentos

| Archivo | Ubicación | Estado |
|---|---|---|
| `CHANGELOG.md` | ❌ No existe | |
| `CONTRIBUTING.md` | ❌ No existe | |
| `LICENSE` | ❌ No existe | (dice MIT en package.json pero no hay archivo) |
| `backend/README.md` | ✅ Existe | Documentación del backend |
| `backend/SETUP_GUIDE.md` | ✅ Existe | Guía de setup |
| `backend/TESTING_GUIDE.md` | ✅ Existe | Guía de testing |
| `backend/*.md` (5 más) | ⚠️ Desorganizados | Deberían estar en `/docs` |
| `docs/INSTALLATION.md` | ✅ Existe | Guía de instalación |

---

## 📊 Resumen de Hallazgos por Prioridad

### 🔴 Prioridad ALTA (Bloquean nivel portfolio)

| # | Hallazgo | Fase |
|---|---|---|
| 1 | **Mezcla ESM/CommonJS** — Inconsistencia de módulos en 20+ archivos | Fase 1 |
| 2 | **Secretos hardcodeados** — 3 JWT fallbacks inseguros en producción | Fase 2 |
| 3 | **README completamente incorrecto** — Describe proyecto React, no Vue | Fase 4 |
| 4 | **0% cobertura de tests** — Solo 1 test en todo el proyecto | Fase 3 |
| 5 | **Carpeta duplicada** — `schooltrack-frontend-new/` es copia inútil | Fase 1 |
| 6 | **30+ console.log en runtime** — Winston instalado pero no usado | Fase 2 |
| 7 | **No hay refresh tokens** — Solo access token sin renovación | Fase 2 |

### 🟡 Prioridad MEDIA

| # | Hallazgo | Fase |
|---|---|---|
| 8 | Archivo duplicado `src/db.js` (CommonJS) vs `src/config/db.js` (ESM) | Fase 1 |
| 9 | Typo en directorio: `scrips/` → `scripts/` | Fase 1 |
| 10 | `Profile.vue` duplicado en `views/` y `pages/` | Fase 1 |
| 11 | Salt rounds = 10 (debería ser 12) | Fase 2 |
| 12 | NoSQL injection middleware incompleto | Fase 2 |
| 13 | Docker-compose raíz sin healthchecks | Fase 1 |
| 14 | CORS demasiado permisivo (lista larga hardcodeada) | Fase 2 |
| 15 | 7 archivos .md sueltos en `/backend` | Fase 1 |
| 16 | `errores.txt` y `create-missing-views.ps1` — archivos residuales | Fase 1 |
| 17 | Archivos de documentación: CHANGELOG, CONTRIBUTING, LICENSE faltantes | Fase 4 |

### 🟢 Prioridad BAJA

| # | Hallazgo | Fase |
|---|---|---|
| 18 | `env.example` sin punto (convención `.env.example`) | Fase 1 |
| 19 | Redis instalado pero no utilizado activamente | Fase 1 |
| 20 | `node-schedule` instalado pero sin uso | Fase 1 |
| 21 | Falta `.editorconfig` y `.nvmrc` | Fase 1 |
| 22 | Frontend usa Vuex en vez de Pinia (funcional, no bloquea) | N/A |
| 23 | `vue.config.js` con hack de webpack copy plugin | Fase 1 |
| 24 | `version: '3.8'` obsoleto en docker-compose | Fase 1 |

---

## 🗓️ Plan de Acción por Fase

### Fase 1: Estructura y Organización
1. Eliminar `schooltrack-frontend-new/` (duplicada)
2. Eliminar `backend/src/db.js` (duplicado CommonJS)
3. Renombrar `scrips/` → `scripts/` (typo)
4. Migrar todos los archivos CommonJS a ESM
5. Mover archivos .md sueltos del backend a `/docs`
6. Eliminar archivos residuales (`errores.txt`, `create-missing-views.ps1`)
7. Resolver duplicado de `Profile.vue`
8. Crear `.editorconfig`, `.nvmrc`, `.env.example` correctos
9. Agregar healthchecks al docker-compose de raíz
10. Actualizar scripts de package.json

### Fase 2: Seguridad y Hardening
1. Eliminar TODOS los fallbacks de secretos hardcodeados
2. Reemplazar console.log/error con winston logger
3. Implementar refresh tokens JWT
4. Subir salt rounds a 12
5. Instalar y usar express-mongo-sanitize (reemplazar middleware custom)
6. Instalar hpp y compression
7. Configurar CORS dinámico desde .env
8. Implementar validaciones Joi/Zod para todos los endpoints
9. Agregar middleware de error global mejorado

### Fase 3: Tests
1. Configurar Jest + supertest + mongodb-memory-server
2. Tests de autenticación (register, login, session, refresh)
3. Tests CRUD (students, vehicles, routes)
4. Tests de WebSocket
5. Tests unitarios frontend (@vue/test-utils)
6. Target: 80%+ cobertura

### Fase 4: Documentación
1. Reescribir README.md completo (Vue 3, no React)
2. Crear CHANGELOG.md
3. Crear CONTRIBUTING.md
4. Crear LICENSE (MIT)
5. Agregar badges
6. Agregar diagrama de arquitectura (Mermaid)
7. Agregar sección de API endpoints actualizada
