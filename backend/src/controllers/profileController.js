import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { asyncHandler } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -sessions');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

/**
 * @desc    Actualizar perfil del usuario
 * @route   PUT /api/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, email } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  // Actualizar campos
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (email && email !== user.email) {
    // Verificar que no exista otro usuario con ese email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    user.email = email;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Perfil actualizado exitosamente',
    data: user
  });
});

/**
 * @desc    Subir foto de perfil
 * @route   POST /api/profile/avatar
 * @access  Private
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No se ha subido ningún archivo'
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  // Si el usuario ya tiene un avatar, eliminar el archivo anterior
  if (user.avatar) {
    const oldFilePath = path.join(__dirname, '../../uploads/avatars', user.avatar);
    try {
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    } catch (error) {
      console.error('Error al eliminar avatar anterior:', error);
    }
  }

  // Guardar nuevo nombre de archivo en la base de datos
  user.avatar = req.file.filename;
  await user.save();

  res.json({
    success: true,
    message: 'Foto de perfil subida exitosamente',
    data: {
      avatar: user.avatar,
      avatarUrl: `/uploads/avatars/${user.avatar}`
    }
  });
});

/**
 * @desc    Obtener foto de perfil
 * @route   GET /api/profile/avatar/:filename
 * @access  Public
 */
export const getAvatar = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  // Validar que no intenten hacer path traversal
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({
      success: false,
      message: 'Nombre de archivo inválido'
    });
  }

  const filePath = path.join(__dirname, '../../uploads/avatars', filename);

  // Verificar que el archivo existe y está dentro del directorio permitido
  if (!fs.existsSync(filePath) || !filePath.startsWith(path.join(__dirname, '../../uploads/avatars'))) {
    return res.status(404).json({
      success: false,
      message: 'Archivo no encontrado'
    });
  }

  res.sendFile(filePath);
});

/**
 * @desc    Cambiar foto de perfil
 * @route   PUT /api/profile/avatar
 * @access  Private
 */
export const changeAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No se ha subido ningún archivo'
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  // Eliminar archivo anterior si existe
  if (user.avatar) {
    const oldFilePath = path.join(__dirname, '../../uploads/avatars', user.avatar);
    try {
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    } catch (error) {
      console.error('Error al eliminar avatar anterior:', error);
    }
  }

  // Guardar nuevo archivo
  user.avatar = req.file.filename;
  await user.save();

  res.json({
    success: true,
    message: 'Foto de perfil actualizada',
    data: {
      avatar: user.avatar,
      avatarUrl: `/uploads/avatars/${user.avatar}`
    }
  });
});

/**
 * @desc    Eliminar foto de perfil
 * @route   DELETE /api/profile/avatar
 * @access  Private
 */
export const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  if (!user.avatar) {
    return res.status(400).json({
      success: false,
      message: 'El usuario no tiene foto de perfil'
    });
  }

  // Eliminar archivo físico
  const filePath = path.join(__dirname, '../../uploads/avatars', user.avatar);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la foto'
    });
  }

  // Limpiar campo en BD
  user.avatar = '';
  await user.save();

  res.json({
    success: true,
    message: 'Foto de perfil eliminada'
  });
});

/**
 * @desc    Cambiar contraseña
 * @route   PUT /api/profile/password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Contraseña actual y nueva son requeridas'
    });
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  // Verificar contraseña actual
  const isPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: 'Contraseña actual incorrecta'
    });
  }

  // Actualizar contraseña
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Contraseña actualizada exitosamente'
  });
});

/**
 * @desc    Obtener perfil de otro usuario
 * @route   GET /api/profile/:userId
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('-password -sessions -activityLog');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

/**
 * @desc    Eliminar usuario (con eliminación de avatar)
 * @route   DELETE /api/profile
 * @access  Private
 */
export const deleteProfile = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere contraseña para eliminar la cuenta'
    });
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  // Verificar contraseña
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: 'Contraseña incorrecta'
    });
  }

  // Eliminar avatar si existe
  if (user.avatar) {
    const filePath = path.join(__dirname, '../../uploads/avatars', user.avatar);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error al eliminar avatar:', error);
    }
  }

  // Eliminar usuario
  await User.findByIdAndDelete(req.user._id);

  res.json({
    success: true,
    message: 'Cuenta eliminada exitosamente'
  });
});

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAvatar,
  changeAvatar,
  deleteAvatar,
  changePassword,
  getUserProfile,
  deleteProfile
};
