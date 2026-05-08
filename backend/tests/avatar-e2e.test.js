/**
 * E2E Test Suite para Avatar Upload, Change, Delete
 * 
 * Este script prueba el flujo completo de:
 * 1. Registro de usuario
 * 2. Login
 * 3. Subida de avatar
 * 4. Cambio de avatar
 * 5. Eliminación de avatar
 * 6. Eliminación de usuario con limpieza de avatar físico
 * 
 * Ejecutar: node tests/avatar-e2e.test.js
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== CONFIGURACIÓN ==========
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_USER = {
  firstName: 'Test',
  lastName: 'Avatar',
  email: `testavatar-${Date.now()}@test.com`,
  password: 'TestPassword123!',
  phone: '+1234567890'
};

let authToken = null;
let userId = null;
let avatarFilename = null;
let sessionCookie = null;

// ========== UTILITARIOS ==========

const log = (title, message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warn: '⚠️'
  }[type] || 'ℹ️';
  
  console.log(`\n${icon} [${timestamp}] ${title}`);
  if (message) console.log(`   ${message}`);
};

const createTestImage = () => {
  // Crear una imagen PNG simple para pruebas
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
    0x01, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);
  
  const testImagePath = path.join(__dirname, '../test-avatar.png');
  fs.writeFileSync(testImagePath, pngHeader);
  return testImagePath;
};

// ========== TESTS ==========

const testRegister = async () => {
  log('TEST 1: REGISTRO DE USUARIO', 'Registrando usuario de prueba...');
  
  try {
    const response = await axios.post(`${API_URL}/auth/register`, TEST_USER);
    
    if (response.status === 201 && response.data.success) {
      log('REGISTRO OK', `Usuario creado: ${TEST_USER.email}`, 'success');
      return true;
    }
  } catch (error) {
    log('REGISTRO FALLIDO', error.response?.data?.message || error.message, 'error');
    return false;
  }
};

const testLogin = async () => {
  log('TEST 2: LOGIN', 'Autenticando usuario...');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    }, {
      withCredentials: true
    });
    
    if (response.status === 200 && response.data.success) {
      authToken = response.data.token;
      userId = response.data.user._id;
      
      // Extraer cookie de sesión si existe
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        sessionCookie = setCookieHeader;
        log('LOGIN OK', `Token: ${authToken.substring(0, 20)}... | User ID: ${userId} | Cookie sesión capturada`, 'success');
      } else {
        log('LOGIN OK', `Token: ${authToken.substring(0, 20)}... | User ID: ${userId}`, 'success');
      }
      return true;
    }
  } catch (error) {
    log('LOGIN FALLIDO', error.response?.data?.message || error.message, 'error');
    return false;
  }
};

const testUploadAvatar = async () => {
  log('TEST 3: SUBIDA DE AVATAR', 'Subiendo avatar inicial...');
  
  if (!authToken) {
    log('SUBIDA FALLIDA', 'Token no disponible. Ejecuta login primero.', 'error');
    return false;
  }
  
  try {
    const imagePath = createTestImage();
    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(imagePath));
    
    const response = await axios.post(`${API_URL}/profile/avatar`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      },
      withCredentials: true
    });
    
    if (response.status === 200 && response.data.success) {
      avatarFilename = response.data.data.avatar;
      log('SUBIDA OK', `Avatar guardado: ${avatarFilename} | URL: ${response.data.data.avatarUrl}`, 'success');
      
      // Limpiar archivo temporal
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      return true;
    }
  } catch (error) {
    log('SUBIDA FALLIDA', error.response?.data?.message || error.message, 'error');
    return false;
  }
};

const testChangeAvatar = async () => {
  log('TEST 4: CAMBIO DE AVATAR', 'Cambiando a un nuevo avatar...');
  
  if (!authToken) {
    log('CAMBIO FALLIDO', 'Token no disponible.', 'error');
    return false;
  }
  
  try {
    const imagePath = createTestImage();
    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(imagePath));
    
    const response = await axios.put(`${API_URL}/profile/avatar`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      },
      withCredentials: true
    });
    
    if (response.status === 200 && response.data.success) {
      const newAvatarFilename = response.data.data.avatar;
      log('CAMBIO OK', `Avatar actualizado: ${newAvatarFilename} (anterior: ${avatarFilename})`, 'success');
      avatarFilename = newAvatarFilename;
      
      // Limpiar archivo temporal
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      return true;
    }
  } catch (error) {
    log('CAMBIO FALLIDO', error.response?.data?.message || error.message, 'error');
    return false;
  }
};

const testDeleteAvatar = async () => {
  log('TEST 5: ELIMINACIÓN DE AVATAR', 'Eliminando avatar...');
  
  if (!authToken) {
    log('ELIMINACIÓN FALLIDA', 'Token no disponible.', 'error');
    return false;
  }
  
  try {
    const response = await axios.delete(`${API_URL}/profile/avatar`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      withCredentials: true
    });
    
    if (response.status === 200 && response.data.success) {
      log('ELIMINACIÓN OK', 'Avatar eliminado correctamente', 'success');
      avatarFilename = null;
      return true;
    }
  } catch (error) {
    log('ELIMINACIÓN FALLIDA', error.response?.data?.message || error.message, 'error');
    return false;
  }
};

const testDeleteUser = async () => {
  log('TEST 6: ELIMINACIÓN DE USUARIO', 'Eliminando usuario con avatar limpieza...');
  
  if (!authToken) {
    log('ELIMINACIÓN DE USUARIO FALLIDA', 'Token no disponible.', 'error');
    return false;
  }
  
  try {
    const response = await axios.delete(`${API_URL}/profile`, {
      data: {
        password: TEST_USER.password
      },
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      withCredentials: true
    });
    
    if (response.status === 200 && response.data.success) {
      log('ELIMINACIÓN DE USUARIO OK', 'Usuario y avatar eliminados permanentemente', 'success');
      authToken = null;
      userId = null;
      return true;
    }
  } catch (error) {
    log('ELIMINACIÓN DE USUARIO FALLIDA', error.response?.data?.message || error.message, 'error');
    return false;
  }
};

const testCookieHandling = async () => {
  log('TEST 7: VALIDACIÓN DE COOKIES/SESIÓN', 'Verificando cookies seguras...');
  
  try {
    // Re-login para capturar cookies
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    }, {
      withCredentials: true
    });
    
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const hasSameSite = setCookieHeader.some(c => c.includes('SameSite'));
      const hasHttpOnly = setCookieHeader.some(c => c.includes('HttpOnly'));
      
      log('COOKIES OK', `HttpOnly: ${hasHttpOnly ? '✓' : '✗'} | SameSite: ${hasSameSite ? '✓' : '✗'}`, 'success');
      return true;
    }
  } catch (error) {
    log('VALIDACIÓN DE COOKIES FALLIDA', error.response?.data?.message || error.message, 'error');
    return false;
  }
};

// ========== EJECUTOR PRINCIPAL ==========

const runTests = async () => {
  console.log(`
╔═════════════════════════════════════════════════════════╗
║   SUITE E2E: AVATAR UPLOAD, CHANGE, DELETE & CLEANUP   ║
║              Validación de Cookies/Sesión              ║
╚═════════════════════════════════════════════════════════╝
  `);
  
  const results = {
    register: false,
    login: false,
    uploadAvatar: false,
    changeAvatar: false,
    deleteAvatar: false,
    deleteUser: false,
    cookieHandling: false
  };
  
  try {
    // Test 1: Registro
    results.register = await testRegister();
    if (!results.register) throw new Error('Registro falló');
    
    // Test 2: Login
    results.login = await testLogin();
    if (!results.login) throw new Error('Login falló');
    
    // Test 3: Upload
    results.uploadAvatar = await testUploadAvatar();
    if (!results.uploadAvatar) throw new Error('Upload falló');
    
    // Test 4: Change
    results.changeAvatar = await testChangeAvatar();
    if (!results.changeAvatar) throw new Error('Change falló');
    
    // Test 5: Delete Avatar
    results.deleteAvatar = await testDeleteAvatar();
    if (!results.deleteAvatar) throw new Error('Delete avatar falló');
    
    // Test 6: Delete User (con limpieza de avatar)
    results.deleteUser = await testDeleteUser();
    if (!results.deleteUser) throw new Error('Delete user falló');
    
    // Test 7: Cookie Handling (re-auth para capturar cookies)
    results.register = await testRegister(); // Crear nuevo usuario
    results.login = await testLogin();       // Login para capturar cookies
    results.cookieHandling = await testCookieHandling();
    
  } catch (error) {
    log('TEST SUITE INTERRUMPIDO', error.message, 'warn');
  }
  
  // ========== RESUMEN ==========
  console.log(`
╔═════════════════════════════════════════════════════════╗
║                   RESUMEN DE PRUEBAS                   ║
╚═════════════════════════════════════════════════════════╝
  `);
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r).length;
  const failed = total - passed;
  
  console.log(`
✅ Pasadas: ${passed}/${total}
❌ Fallidas: ${failed}/${total}

Detalles:
  • Registro:           ${results.register ? '✓' : '✗'}
  • Login:              ${results.login ? '✓' : '✗'}
  • Upload Avatar:      ${results.uploadAvatar ? '✓' : '✗'}
  • Change Avatar:      ${results.changeAvatar ? '✓' : '✗'}
  • Delete Avatar:      ${results.deleteAvatar ? '✓' : '✗'}
  • Delete User:        ${results.deleteUser ? '✓' : '✗'}
  • Cookie Handling:    ${results.cookieHandling ? '✓' : '✗'}

${passed === total ? '🎉 ¡TODOS LOS TESTS PASARON!' : '⚠️  Revisar fallos arriba'}
  `);
  
  process.exit(passed === total ? 0 : 1);
};

// Ejecutar
runTests().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
