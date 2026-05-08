# 🧪 Guía de Pruebas: Avatar Upload, Change, Delete & Cleanup

Este documento explica cómo ejecutar las pruebas E2E y verificaciones de integridad para validar el sistema de avatares.

## 📋 Requisitos Previos

- **Node.js** 16+ instalado
- **MongoDB** corriendo localmente o accesible via `MONGODB_URI`
- **Backend** en ejecución (puerto 3000)
- **Frontend** en ejecución (puerto 8080, opcional para pruebas)

## 🚀 Instalación de Dependencias

```bash
cd backend
npm install
# o si npm install falla por permisos:
npm install --legacy-peer-deps
```

## 🧩 Suite E2E: Avatar Upload, Change, Delete

### ¿Qué prueba?

```
1. REGISTRO       → Crear usuario de prueba
2. LOGIN          → Autenticarse y obtener token JWT
3. UPLOAD AVATAR  → Subir avatar inicial
4. CHANGE AVATAR  → Reemplazar avatar (verifica limpieza del anterior)
5. DELETE AVATAR  → Eliminar avatar (limpieza en BD)
6. DELETE USER    → Eliminar usuario (limpieza de avatar físico)
7. COOKIES        → Validar seguridad de sesión (HttpOnly, SameSite)
```

### Ejecutar las Pruebas E2E

```bash
# Con backend ejecutándose en http://localhost:3000
node tests/avatar-e2e.test.js

# Con backend remoto (ej: Render)
API_URL=https://tu-app.onrender.com/api node tests/avatar-e2e.test.js
```

### Salida Esperada

```
✅ [2025-11-18T21:50:10.123Z] TEST 1: REGISTRO DE USUARIO
   Usuario creado: testavatar-1234567@test.com

✅ [2025-11-18T21:50:11.456Z] TEST 2: LOGIN
   Token: eyJhbGciOiJIUzI1Ni... | User ID: 507f1f77...

✅ [2025-11-18T21:50:12.789Z] TEST 3: SUBIDA DE AVATAR
   Avatar guardado: 1234567-987654321.png | URL: /uploads/avatars/1234567-987654321.png

✅ [2025-11-18T21:50:13.222Z] TEST 4: CAMBIO DE AVATAR
   Avatar actualizado: 1234568-987654322.png (anterior: 1234567-987654321.png)

✅ [2025-11-18T21:50:14.555Z] TEST 5: ELIMINACIÓN DE AVATAR
   Avatar eliminado correctamente

✅ [2025-11-18T21:50:15.888Z] TEST 6: ELIMINACIÓN DE USUARIO
   Usuario y avatar eliminados permanentemente

✅ [2025-11-18T21:50:16.221Z] TEST 7: VALIDACIÓN DE COOKIES/SESIÓN
   HttpOnly: ✓ | SameSite: ✓

═══════════════════════════════════════════════════════════════
✅ Pasadas: 7/7
❌ Fallidas: 0/7

🎉 ¡TODOS LOS TESTS PASARON!
```

## 🔍 Script de Verificación de Integridad

### ¿Qué verifica?

```
1. DIRECTORIOS     → /uploads y /uploads/avatars existen
2. PERMISOS        → R/W en carpeta avatars
3. BD ↔ DISCO      → Sincronización usuarios con archivo físico
4. CONVENCIÓN      → Nombres de archivo siguen {timestamp}-{random}.ext
5. USO DISCO       → Espacio usado en /uploads/avatars
```

### Ejecutar Verificación

```bash
# Verificar integridad de avatares en disco y BD
node scripts/verify-avatars.js
```

### Salida Esperada

```
📁 Verificando estructura de directorios...

✅ Directorio /uploads existe: C:\schooltrack\schooltrack\backend\uploads
✅ Directorio /uploads/avatars existe: C:\schooltrack\schooltrack\backend\uploads\avatars
⚠️  Archivos de avatar en disco: 3 archivos
⚠️    - 1234567-987654321.png (245.50 KB, creado: 2025-11-18T21:50:10.000Z)
⚠️    - 1234568-987654322.png (256.75 KB, creado: 2025-11-18T21:50:13.000Z)
⚠️    - 1234569-987654323.png (267.30 KB, creado: 2025-11-18T21:50:15.000Z)

🔐 Verificando permisos de lectura/escritura...

✅ Permisos de lectura/escritura OK en C:\schooltrack\schooltrack\backend\uploads\avatars

🗄️  Verificando sincronización MongoDB → Disco...

✅ Conectado a MongoDB: mongodb://localhost:27017/schooltrack
⚠️  Encontrados 2 usuarios con avatar
✅ Avatar de John Doe: 1234568-987654322.png ✓ existe en disco
✅ Avatar de Jane Smith: 1234569-987654323.png ✓ existe en disco

  📊 Sincronización: 2/2 archivos existen

✅ Conexión MongoDB cerrada

📝 Verificando convención de nombres de archivos...

✅ Todos los archivos siguen la convención: {timestamp}-{random}.ext (3 archivos)

💾 Analizando uso de espacio en disco...

⚠️  Uso total en /uploads/avatars: 769.55 MB (0.75 GB)
✅ Uso de espacio moderado

═══════════════════════════════════════════════════════════════
✓ Verificaciones pasadas: 8
✗ Verificaciones fallidas: 0
! Advertencias: 5

✅ Todas las verificaciones PASARON
```

## 🛠️ Pruebas Manuales con cURL

### 1. Registrar usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "phone": "+1234567890"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Guardar el token: export TOKEN="eyJhbGciOi..."
```

### 3. Subir Avatar

```bash
curl -X POST http://localhost:3000/api/profile/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@/ruta/a/imagen.jpg"
```

### 4. Cambiar Avatar

```bash
curl -X PUT http://localhost:3000/api/profile/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@/ruta/a/nueva-imagen.png"
```

### 5. Obtener Avatar

```bash
curl -X GET http://localhost:3000/api/profile/avatar/1234567-987654321.png \
  -o imagen-descargada.jpg
```

### 6. Eliminar Avatar

```bash
curl -X DELETE http://localhost:3000/api/profile/avatar \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Eliminar Usuario (con limpieza de avatar)

```bash
curl -X DELETE http://localhost:3000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "TestPass123!"}'
```

## ✅ Checklist de Validación

- [ ] Suite E2E pasa completamente (7/7 tests)
- [ ] Script de verificación pasa (0 fallos)
- [ ] Archivos de avatar se crean en `/uploads/avatars/`
- [ ] Archivos antiguos se eliminan al cambiar avatar
- [ ] Avatar se elimina del disco al borrar usuario
- [ ] Nombres de archivo siguen convención `{timestamp}-{random}.ext`
- [ ] Cookies tienen flags `HttpOnly`, `SameSite=strict`
- [ ] Token JWT funciona correctamente
- [ ] Sesión se destruye al logout
- [ ] Permisos de archivo/carpeta son correctos

## 🚀 Deploy a Render

Las pruebas también funcionan contra la instancia en Render:

```bash
API_URL=https://tu-app.onrender.com/api node tests/avatar-e2e.test.js
```

> **Nota:** Asegúrate que las variables de entorno en Render incluyan:
> - `MONGODB_URI`: URL de base de datos
> - `JWT_SECRET`: Clave secreta JWT
> - `SECRET_SESSION`: Clave secreta de sesión

## 🐛 Troubleshooting

### Error: `Cannot find module 'express-session'`
```bash
npm install --legacy-peer-deps
```

### Error: `ENOENT: no such file or directory, mkdir 'C:\'`
- Permisos en C:\ — ejecuta terminal como administrador

### Error: `connect ECONNREFUSED 127.0.0.1:3000`
- Backend no está ejecutándose
- Usa `npm run dev` en carpeta backend

### Error: `connection refused` (MongoDB)
- MongoDB no está corriendo
- Inicia: `mongod` (local) o verifica `MONGODB_URI` en `.env`

## 📞 Soporte

Para más información sobre el sistema de avatares, consulta:
- `backend/src/middleware/fileUploadMiddleware.js` — Configuración Multer
- `backend/src/controllers/profileController.js` — Lógica de avatar
- `frontend/src/components/ProfileAvatarUpload.vue` — Componente UI
