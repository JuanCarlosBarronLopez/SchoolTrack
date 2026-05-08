import express from 'express';
import {
  uploadFiles,
  uploadSingleFile,
  downloadFile,
  deleteFile,
  getFilesList
} from '../controllers/fileController.js';
import {
  uploadSingle,
  uploadMultiple,
  uploadMixed,
  handleUploadError
} from '../middleware/fileUploadMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Rutas para manejo de archivos
 */

// Subir archivo único
router.post('/upload/single', protect, uploadSingle, handleUploadError, uploadSingleFile);

// Subir múltiples archivos
router.post('/upload/multiple', protect, uploadMultiple, handleUploadError, uploadFiles);

// Subir archivos de diferentes tipos
router.post('/upload/mixed', protect, uploadMixed, handleUploadError, uploadFiles);

// Descargar archivo
router.get('/download/:type/:filename', protect, downloadFile);

// Eliminar archivo
router.delete('/delete/:type/:filename', protect, authorize('admin'), deleteFile);

// Obtener lista de archivos por tipo
router.get('/list/:type', protect, getFilesList);

export default router;
