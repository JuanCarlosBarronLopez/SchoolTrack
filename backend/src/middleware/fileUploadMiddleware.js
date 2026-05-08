import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuración de almacenamiento para archivos
 */
const uploadDir = path.join(__dirname, '../../uploads');

// Crear directorio si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Mapear nombres de campo a carpetas específicas.
    // Usualmente el campo 'avatar' debe guardarse en la carpeta 'avatars'
    const fieldDirName = file.fieldname === 'avatar' ? 'avatars' : file.fieldname;
    const dir = path.join(uploadDir, fieldDirName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

/**
 * Filtro de archivos permitidos
 */
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

/**
 * Configuración de multer
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

/**
 * Middleware para subir archivo único
 */
export const uploadSingle = upload.single('file');

/**
 * Middleware para subir múltiples archivos
 */
export const uploadMultiple = upload.array('files', 5);

/**
 * Middleware para subir archivos de diferentes tipos
 */
export const uploadMixed = upload.fields([
  { name: 'photos', maxCount: 5 },
  { name: 'documents', maxCount: 3 },
  { name: 'profile', maxCount: 1 }
]);

/**
 * Middleware para manejo de errores de multer
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        message: 'Archivo demasiado grande. Máximo 10 MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Máximo permitido alcanzado'
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

export default upload;
