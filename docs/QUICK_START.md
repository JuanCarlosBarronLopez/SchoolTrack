# 🚀 SchoolTrack - Quick Start Guide

**Comenzar en 5 minutos**

---

## 1️⃣ Requisitos (Verificar)

```bash
node --version    # Debe ser v18+
npm --version     # Debe ser v9+
```

Si no los tienes: https://nodejs.org/

---

## 2️⃣ Clonar & Entrar

```bash
git clone https://github.com/tu-usuario/schooltrack.git
cd schooltrack/backend
```

---

## 3️⃣ Setup Automatizado

### Windows (PowerShell)
```powershell
.\setup.ps1
```

### Mac/Linux (Bash)
```bash
bash setup.sh
```

### Manual
```bash
# Copiar .env
cp env.example .env

# Instalar dependencias
npm install

# Crear directorios
mkdir -p uploads/{photos,documents,profiles,reports}
mkdir -p logs
```

---

## 4️⃣ Configurar MongoDB

### Opción A: Local (recomendado para desarrollo)
```bash
# Instalar desde: https://www.mongodb.com/try/download/community
mongod
```

### Opción B: Docker (más fácil)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Opción C: MongoDB Atlas (nube - recomendado para producción)
1. Ir a https://www.mongodb.com/cloud/atlas
2. Crear cuenta gratuita
3. Crear cluster
4. Copiar connection string
5. Pegar en `.env` como `MONGODB_URI`

---

## 5️⃣ Editar .env (IMPORTANTE!)

```bash
# Abrir archivo
nano .env              # Mac/Linux
notepad .env          # Windows
code .env             # VS Code

# Cambiar estos valores:
JWT_SECRET=tu-secreto-muy-seguro-cambiar-esto
SECRET_SESSION=otra-clave-segura-cambiar-esto
MONGODB_URI=mongodb://localhost:27017/schooltrack
```

---

## 6️⃣ Iniciar Servidor

```bash
npm run dev
```

Debería ver:
```
✅ MongoDB conectado en: localhost
🚀 SchoolTrack Backend Iniciado
📍 Puerto: 3000
📝 Entorno: development
```

---

## 7️⃣ Verificar que Funciona

### En navegador:
```
http://localhost:3000/api/health
```

Debería retornar:
```json
{
  "success": true,
  "message": "Servidor funcionando",
  "environment": "development"
}
```

---

## 🎯 Rutas Principales para Probar

### Health Check
```
GET http://localhost:3000/api/health
```

### Crear Sesión
```
POST http://localhost:3000/api/sessions/create
Body: {
  "userId": "123",
  "username": "test",
  "email": "test@example.com",
  "role": "admin"
}
```

### Subir Archivo
```
POST http://localhost:3000/api/files/upload/single
Headers: Authorization: Bearer YOUR_TOKEN
Form Data: file=<archivo>
```

---

## 📚 Documentación Completa

Para más información:
- 📖 **Guía Completa:** `SETUP_GUIDE.md`
- 📖 **Mejoras:** `IMPROVEMENTS.md`
- 📖 **API Endpoints:** `SETUP_GUIDE.md` (sección API Endpoints)
- 📖 **Troubleshooting:** `SETUP_GUIDE.md` (sección Solución de Problemas)

---

## 🔧 Comandos Útiles

```bash
# Desarrollo (con reinicio automático)
npm run dev

# Producción
npm start

# Tests
npm test

# Linting
npm run lint

# Crear índices BD
npm run create-indexes

# Seed datos de prueba
npm run seed
```

---

## 🐛 Problemas Comunes

### Error: "MongoDB connection failed"
**Solución:** Asegúrate que MongoDB está corriendo
```bash
mongod              # Local
# o
docker ps          # Verificar contenedor Docker
```

### Error: "Port 3000 already in use"
**Solución:** Cambiar puerto en `.env`
```env
PORT=3001
```

### Error: "Module not found"
**Solución:** Reinstalar dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "CORS error"
**Solución:** Verificar `FRONTEND_URL` en `.env`
```env
FRONTEND_URL=http://localhost:8080
```

---

## 🎓 Próximos Pasos

1. ✅ Validar que backend funciona
2. ✅ Instalar y arrancar frontend
3. ✅ Crear usuario de prueba
4. ✅ Probar rutas principales
5. ✅ Leer documentación completa

---

## 💡 Tips

- 📌 Guarda logs en `logs/` folder
- 📌 Archivos en `uploads/` folder
- 📌 Usa Postman/Insomnia para testing de API
- 📌 Consulta `SETUP_GUIDE.md` para debugging

---

## ✅ Checklist

- [ ] Node.js v18+ instalado
- [ ] npm instalado
- [ ] MongoDB corriendo
- [ ] `.env` configurado
- [ ] `npm install` completado
- [ ] `npm run dev` funcionando
- [ ] Health check OK (GET /api/health)
- [ ] Sesiones funcionando
- [ ] Archivos funcionando

---

## 🚀 ¡Listo!

Si ves el mensaje "🚀 SchoolTrack Backend Iniciado" el setup fue exitoso.

**Para frontend:**
```bash
cd ../frontend
npm install
npm run dev
```

---

**¿Preguntas?** Ver `SETUP_GUIDE.md` o contacta support@schooltrack.com

**¡A desarrollar! 🎉**
