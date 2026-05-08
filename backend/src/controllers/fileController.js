import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { asyncHandler } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Controlador para manejo de archivos
 */

/**
 * Subir archivos
 */
export const uploadFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No se subieron archivos'
    });
  }

  const uploadedFiles = req.files.map(file => ({
    originalName: file.originalname,
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: `/uploads/${file.fieldname}/${file.filename}`
  }));

  res.json({
    success: true,
    message: 'Archivos subidos correctamente',
    files: uploadedFiles
  });
});

/**
 * Subir archivo único
 */
export const uploadSingleFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No se subió archivo'
    });
  }

  res.json({
    success: true,
    message: 'Archivo subido correctamente',
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.fieldname}/${req.file.filename}`
    }
  });
});

/**
 * Descargar archivo
 */
export const downloadFile = asyncHandler(async (req, res) => {
  const { filename, type } = req.params;

  if (!type || !filename) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros faltantes'
    });
  }

  const uploadDir = path.join(__dirname, '../../uploads');
  const filePath = path.join(uploadDir, type, filename);

  // Validar que el archivo existe y está dentro del directorio permitido
  if (!filePath.startsWith(uploadDir) || !fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'Archivo no encontrado'
    });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Error descargando archivo:', err);
      res.status(500).json({
        success: false,
        message: 'Error descargando archivo'
      });
    }
  });
});

/**
 * Eliminar archivo
 */
export const deleteFile = asyncHandler(async (req, res) => {
  const { filename, type } = req.params;

  if (!type || !filename) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros faltantes'
    });
  }

  const uploadDir = path.join(__dirname, '../../uploads');
  const filePath = path.join(uploadDir, type, filename);

  // Validar que el archivo está dentro del directorio permitido
  if (!filePath.startsWith(uploadDir)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado'
    });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'Archivo no encontrado'
    });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando archivo'
    });
  }
});

/**
 * Obtener lista de archivos
 */
export const getFilesList = asyncHandler(async (req, res) => {
  const { type } = req.params;

  if (!type) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no especificado'
    });
  }

  const uploadDir = path.join(__dirname, '../../uploads');
  const typePath = path.join(uploadDir, type);

  if (!fs.existsSync(typePath)) {
    return res.json({
      success: true,
      files: []
    });
  }

  try {
    const files = fs.readdirSync(typePath).map(filename => {
      const filePath = path.join(typePath, filename);
      const stats = fs.statSync(filePath);

      return {
        filename,
        size: stats.size,
        uploadedAt: stats.birthtime,
        path: `/uploads/${type}/${filename}`
      };
    });

    res.json({
      success: true,
      files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo lista de archivos'
    });
  }
});

export default {
  uploadFiles,
  uploadSingleFile,
  downloadFile,
  deleteFile,
  getFilesList
};
