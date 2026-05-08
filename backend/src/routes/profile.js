import express from 'express';
import * as profileController from '../controllers/profileController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import uploadMiddleware from '../middleware/fileUploadMiddleware.js';

const router = express.Router();

// Rutas de perfil (protegidas)
router.use(protect); // Todas las rutas requieren autenticación

// Obtener perfil actual
router.get('/', profileController.getProfile);

// Actualizar perfil
router.put('/', profileController.updateProfile);

// Subir foto de perfil
router.post('/avatar', uploadMiddleware.single('avatar'), profileController.uploadAvatar);

// Cambiar foto de perfil
router.put('/avatar', uploadMiddleware.single('avatar'), profileController.changeAvatar);

// Eliminar foto de perfil
router.delete('/avatar', profileController.deleteAvatar);

// Cambiar contraseña
router.put('/password', profileController.changePassword);

// Eliminar perfil
router.delete('/', profileController.deleteProfile);

// Obtener perfil público de otro usuario
router.get('/:userId', profileController.getUserProfile);

// Obtener archivo de avatar (público)
router.get('/avatar/:filename', profileController.getAvatar);

export default router;
