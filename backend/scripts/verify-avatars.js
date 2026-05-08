#!/usr/bin/env node

/**
 * Script de Verificación de Integridad de Avatares
 * 
 * Valida que:
 * 1. Carpeta /uploads/avatars existe
 * 2. Archivos de avatar se guardan correctamente
 * 3. Eliminación de archivos funciona
 * 4. Base de datos sincroniza con archivos físicos
 * 
 * Ejecutar: node scripts/verify-avatars.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== CONFIGURACIÓN ==========

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schooltrack';

let results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// ========== UTILITARIOS ==========

const log = (status, message) => {
  const timestamp = new Date().toISOString();
  const icon = {
    '✓': '✅',
    '✗': '❌',
    '!': '⚠️'
  }[status[0]] || 'ℹ️';
  
  console.log(`${icon} [${timestamp}] ${message}`);
  
  if (status === '✓') results.passed++;
  else if (status === '✗') results.failed++;
  else if (status === '!') results.warnings++;
};

// ========== VERIFICACIONES ==========

const checkDirectories = () => {
  console.log('\n📁 Verificando estructura de directorios...\n');
  
  // Verificar /uploads
  if (fs.existsSync(UPLOADS_DIR)) {
    log('✓', `Directorio /uploads existe: ${UPLOADS_DIR}`);
  } else {
    log('✗', `Directorio /uploads NO EXISTE: ${UPLOADS_DIR}`);
    return;
  }
  
  // Verificar /uploads/avatars
  if (fs.existsSync(AVATARS_DIR)) {
    log('✓', `Directorio /uploads/avatars existe: ${AVATARS_DIR}`);
    
    const files = fs.readdirSync(AVATARS_DIR);
    log('!', `Archivos de avatar en disco: ${files.length} archivos`);
    
    if (files.length > 0) {
      files.slice(0, 5).forEach(file => {
        const filePath = path.join(AVATARS_DIR, file);
        const stats = fs.statSync(filePath);
        log('!', `  - ${file} (${(stats.size / 1024).toFixed(2)} KB, creado: ${stats.birthtime.toISOString()})`);
      });
      
      if (files.length > 5) {
        log('!', `  ... y ${files.length - 5} archivos más`);
      }
    }
  } else {
    log('✗', `Directorio /uploads/avatars NO EXISTE: ${AVATARS_DIR}`);
  }
};

const checkPermissions = () => {
  console.log('\n🔐 Verificando permisos de lectura/escritura...\n');
  
  try {
    // Intentar crear un archivo temporal
    const tempFile = path.join(AVATARS_DIR, '.permissions-test');
    fs.writeFileSync(tempFile, 'test');
    fs.unlinkSync(tempFile);
    log('✓', `Permisos de lectura/escritura OK en ${AVATARS_DIR}`);
  } catch (error) {
    log('✗', `Problema de permisos en ${AVATARS_DIR}: ${error.message}`);
  }
};

const checkMongoDBSync = async () => {
  console.log('\n🗄️  Verificando sincronización MongoDB → Disco...\n');
  
  try {
    // Conectar MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    log('✓', `Conectado a MongoDB: ${MONGODB_URI}`);
    
    // Importar modelo User
    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      avatar: String
    });
    
    const User = mongoose.model('User', userSchema, 'users');
    
    // Buscar usuarios con avatar
    const usersWithAvatar = await User.find({ avatar: { $ne: '' } }).limit(5);
    
    if (usersWithAvatar.length === 0) {
      log('!', 'No hay usuarios con avatar en la base de datos');
    } else {
      log('!', `Encontrados ${usersWithAvatar.length} usuarios con avatar`);
      
      let filesExist = 0;
      let filesMissing = 0;
      
      usersWithAvatar.forEach(user => {
        const filePath = path.join(AVATARS_DIR, user.avatar);
        if (fs.existsSync(filePath)) {
          log('✓', `Avatar de ${user.firstName} ${user.lastName}: ${user.avatar} ✓ existe en disco`);
          filesExist++;
        } else {
          log('✗', `Avatar de ${user.firstName} ${user.lastName}: ${user.avatar} ✗ NO existe en disco`);
          filesMissing++;
        }
      });
      
      console.log(`\n  📊 Sincronización: ${filesExist}/${usersWithAvatar.length} archivos existen`);
      
      if (filesMissing > 0) {
        log('!', `⚠️  ${filesMissing} archivo(s) de avatar NO sincronizado(s) con disco`);
      }
    }
    
    await mongoose.connection.close();
    log('✓', 'Conexión MongoDB cerrada');
    
  } catch (error) {
    log('✗', `Error al conectar MongoDB: ${error.message}`);
  }
};

const checkFileNaming = () => {
  console.log('\n📝 Verificando convención de nombres de archivos...\n');
  
  try {
    const files = fs.readdirSync(AVATARS_DIR);
    
    if (files.length === 0) {
      log('!', 'No hay archivos de avatar para verificar');
      return;
    }
    
    const filePattern = /^\d+-\d+\.\w+$/; // timestamp-random.ext
    const validFiles = files.filter(f => filePattern.test(f));
    const invalidFiles = files.filter(f => !filePattern.test(f));
    
    if (validFiles.length === files.length) {
      log('✓', `Todos los archivos siguen la convención: {timestamp}-{random}.ext (${files.length} archivos)`);
    } else {
      log('!', `${validFiles.length}/${files.length} archivos siguen convención`);
      
      if (invalidFiles.length > 0) {
        invalidFiles.slice(0, 3).forEach(file => {
          log('!', `  Archivo con nombre no estándar: ${file}`);
        });
      }
    }
    
  } catch (error) {
    log('✗', `Error al verificar nombres: ${error.message}`);
  }
};

const checkDiskUsage = () => {
  console.log('\n💾 Analizando uso de espacio en disco...\n');
  
  try {
    let totalSize = 0;
    const files = fs.readdirSync(AVATARS_DIR);
    
    files.forEach(file => {
      const filePath = path.join(AVATARS_DIR, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });
    
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    const sizeInGB = (totalSize / (1024 * 1024 * 1024)).toFixed(4);
    
    log('!', `Uso total en /uploads/avatars: ${sizeInMB} MB (${sizeInGB} GB)`);
    
    if (totalSize > 500 * 1024 * 1024) {
      log('!', '⚠️  Advertencia: Uso de espacio > 500 MB');
    } else {
      log('✓', `Uso de espacio moderado`);
    }
    
  } catch (error) {
    log('✗', `Error al analizar uso: ${error.message}`);
  }
};

// ========== EJECUTOR PRINCIPAL ==========

const main = async () => {
  console.log(`
╔═════════════════════════════════════════════════════════╗
║     VERIFICACIÓN DE INTEGRIDAD DE AVATARES - v1.0      ║
║            Validar sincronización BD ↔ Disco           ║
╚═════════════════════════════════════════════════════════╝
  `);
  
  checkDirectories();
  checkPermissions();
  await checkMongoDBSync();
  checkFileNaming();
  checkDiskUsage();
  
  // ========== RESUMEN ==========
  console.log(`
╔═════════════════════════════════════════════════════════╗
║                   RESUMEN DE VERIFICACIÓN              ║
╚═════════════════════════════════════════════════════════╝

✓ Verificaciones pasadas: ${results.passed}
✗ Verificaciones fallidas: ${results.failed}
! Advertencias: ${results.warnings}

Total: ${results.passed + results.failed + results.warnings}

${results.failed === 0 ? '✅ Todas las verificaciones PASARON' : '⚠️  Revisar fallos arriba'}
  `);
  
  process.exit(results.failed === 0 ? 0 : 1);
};

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
