# Guía de inicio rápido para desarrollo

Este archivo contiene instrucciones paso a paso para iniciar el proyecto en tu máquina local.

## Requisitos

- Node.js v14 o superior
- npm
- MongoDB (instalado localmente o acceso a instancia remota)

## Pasos

### 1. Configurar variables de entorno

En la raíz del proyecto, asegúrate de que el archivo `.env` exista con el contenido:

```bash
VITE_API_URL=http://localhost:4000
MONGO_URI=mongodb://localhost:27017/schooltrack
JWT_SECRET=tu_secreto_jwt_seguro_aqui
PORT=4000
```

Si no existe, copia desde `.env.example`:

```bash
cp .env.example .env
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar MongoDB (si está instalado localmente)

```bash
mongod
```

### 4. Ejecutar en dos terminales separadas

Terminal 1 - Servidor API:

```bash
npm run server
```

Terminal 2 - Frontend:

```bash
npm run dev
```

### 5. Crear el primer administrador

En otra terminal:

```bash
npm run seed:admin tu_email@ejemplo.com tu_contraseña
```

Ejemplo:

```bash
npm run seed:admin admin@utsjr.edu.mx Admin123
```

### 6. Acceder a la aplicación

Abre tu navegador en la URL que indique Vite (normalmente `http://localhost:8080`)

- Email: `admin@utsjr.edu.mx`
- Contraseña: `Admin123`

## Resolución de problemas

### MongoDB no conecta

- Verifica que MongoDB está en ejecución (comando `mongod`)
- Comprueba que `MONGO_URI` en `.env` es correcta
- Por defecto es `mongodb://localhost:27017/schooltrack`

### Puerto 4000 en uso

- Cambia el puerto en `.env` (`PORT=5000`) y en `VITE_API_URL` (`http://localhost:5000`)

### Errores de módulos no encontrados

- Ejecuta `npm install` en la raíz y en `server/`
- Elimina `node_modules` y `package-lock.json`, luego reinstala si persiste

## Estructura básica

```
schooltrack-profiles-main/
├── src/                    # Código frontend (React + TypeScript)
├── server/                 # Código backend (Express + MongoDB)
├── public/                 # Archivos estáticos
├── .env                    # Variables de entorno (no compartir)
├── .env.example            # Ejemplo de variables (compartible)
└── package.json            # Scripts y dependencias
```

## Scripts disponibles

- `npm run dev` — Inicia Vite en desarrollo
- `npm run server` — Inicia servidor Express en puerto 4000
- `npm run seed:admin <email> <password>` — Crea usuario administrador
- `npm run build` — Compila el frontend para producción
- `npm run lint` — Ejecuta ESLint
