import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

const signAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Registro
export const register = async (req, res) => {
  try {
    let { name, firstName, lastName, email, password, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email y contraseña requeridos' });

    if (!firstName && !lastName && name) {
      const parts = name.trim().split(' ');
      firstName = parts.shift();
      lastName = parts.join(' ');
    }

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Usuario ya registrado' });

    const user = await User.create({
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      password,
      role: role || 'parent',
      status: 'active',
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    
    // Almacenar el refreshToken en el usuario (opcional, para stateful revocation)
    user.profile = user.profile || {};
    user.profile.sessions = user.profile.sessions || [];
    user.createSession(refreshToken, req.get('User-Agent'), req);
    
    setRefreshCookie(res, refreshToken);

    const userSafe = user.toObject();
    delete userSafe.password;

    res.status(201).json({ token: accessToken, user: userSafe });
  } catch (err) {
    logger.error('Error en registro', { error: err.message, stack: err.stack });
    res.status(500).json({ message: 'Error en registro', detail: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email y contraseña requeridos' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Usuario inactivo' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    
    // Guardar la sesión
    user.profile = user.profile || {};
    user.profile.sessions = user.profile.sessions || [];
    user.createSession(refreshToken, req.get('User-Agent'), req);

    setRefreshCookie(res, refreshToken);

    const userSafe = user.toObject();
    delete userSafe.password;

    res.json({ token: accessToken, user: userSafe });
  } catch (err) {
    logger.error('Error en login', { error: err.message, stack: err.stack });
    res.status(500).json({ message: 'Error en login', detail: err.message });
  }
};

// Perfil
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id || req.user?._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    const userSafe = user.toObject();
    delete userSafe.password;
    res.json(userSafe);
  } catch (err) {
    logger.error('Error al obtener perfil', { error: err.message, stack: err.stack });
    res.status(500).json({ message: 'Error al obtener perfil', detail: err.message });
  }
};

// Actualizar Perfil
export const updateProfile = async (req, res) => {
  try {
    const { name, firstName, lastName, phone, avatar } = req.body;
    const update = { phone, avatar };

    if (name && !firstName && !lastName) {
      const parts = name.trim().split(' ');
      update.firstName = parts.shift();
      update.lastName = parts.join(' ');
    } else {
      if (firstName) update.firstName = firstName;
      if (lastName) update.lastName = lastName;
    }

    const user = await User.findByIdAndUpdate(req.user?.id || req.user?._id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    logger.error('Error al actualizar perfil', { error: err.message, stack: err.stack });
    res.status(500).json({ message: 'Error al actualizar perfil', detail: err.message });
  }
};

// Refrescar Token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token no proporcionado' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    const decoded = jwt.verify(refreshToken, refreshSecret);

    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Usuario inválido o inactivo' });
    }

    // Opcional: verificar que la sesión exista en user.profile.sessions
    const sessionExists = user.profile?.sessions?.some(s => s.token === refreshToken && s.isActive);
    if (!sessionExists) {
      return res.status(401).json({ message: 'Sesión expirada o revocada' });
    }

    const accessToken = signAccessToken(user);
    res.json({ token: accessToken });
  } catch (err) {
    logger.error('Error al refrescar token', { error: err.message });
    return res.status(401).json({ message: 'Refresh token inválido o expirado' });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (refreshToken && req.user) {
      const user = await User.findById(req.user.id || req.user._id);
      if (user && user.profile && user.profile.sessions) {
        user.profile.sessions = user.profile.sessions.filter(s => s.token !== refreshToken);
        await user.save();
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  } catch (err) {
    logger.error('Error al hacer logout', { error: err.message });
    res.status(500).json({ message: 'Error al cerrar sesión' });
  }
};
