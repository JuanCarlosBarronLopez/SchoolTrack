import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  // Información básica
  firstName: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres']
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true,
    minlength: [2, 'El apellido debe tener al menos 2 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9\-+\s()]{7,}$/, 'Teléfono inválido']
  },
  avatar: {
    type: String,
    default: '',
    trim: true
  },

  // Rol y permisos
  role: {
    type: String,
    enum: {
      values: ['admin', 'driver', 'parent', 'school_admin', 'student'],
      message: 'Rol no válido'
    },
    default: 'parent'
  },
  permissions: [{
    type: String,
    enum: [
      'read:location',
      'read:route',
      'read:student',
      'write:location',
      'write:route',
      'write:student',
      'delete:location',
      'delete:route',
      'delete:student',
      'manage:users',
      'manage:vehicles'
    ]
  }],

  // Estado del usuario
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  verificationCodeExpiry: Date,

  // Profiles por rol
  profile: {
    // Perfil de conductor
    driver: {
      licenseNumber: String,
      licenseExpiry: Date,
      experience: { type: Number, min: 0 },
      vehicleType: String,
      certifications: [String],
      backgroundCheckDate: Date,
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String
      },
      ratings: {
        averageRating: { type: Number, min: 0, max: 5, default: 0 },
        totalRatings: { type: Number, default: 0 },
        reviews: [{
          rating: Number,
          comment: String,
          reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          createdAt: { type: Date, default: Date.now }
        }]
      }
    },

    // Perfil de padre
    parent: {
      children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
      preferredContactMethod: {
        type: String,
        enum: ['email', 'sms', 'push', 'call'],
        default: 'push'
      },
      notificationSettings: {
        pickup: { type: Boolean, default: true },
        dropoff: { type: Boolean, default: true },
        delays: { type: Boolean, default: true },
        emergencies: { type: Boolean, default: true },
        dailySummary: { type: Boolean, default: false },
        detours: { type: Boolean, default: true }
      },
      billingAddress: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
      }
    },

    // Perfil de estudiante
    student: {
      studentId: { type: String, unique: true, sparse: true },
      grade: String,
      school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
      dateOfBirth: Date,
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String
      },
      medicalInfo: {
        allergies: [String],
        medications: [String],
        specialNeeds: String,
        bloodType: String,
        insurance: {
          provider: String,
          policyNumber: String
        }
      },
      qrCode: { type: String, unique: true, sparse: true },
      currentStatus: {
        status: {
          type: String,
          enum: ['home', 'school', 'transport', 'absent', 'unknown'],
          default: 'unknown'
        },
        lastUpdate: Date,
        vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
        driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    },

    // Ubicación actual
    currentLocation: {
      latitude: Number,
      longitude: Number,
      timestamp: Date,
      accuracy: { type: Number, default: 10 }
    },

    // Estado online
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },

    // Notificaciones
    notificationSettings: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      vibration: { type: Boolean, default: true }
    },

    // Dispositivos
    devices: [{
      token: String,
      type: { type: String, enum: ['web', 'ios', 'android'] },
      name: String,
      lastUsed: Date,
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }],

    // Sesiones
    sessions: [{
      token: String,
      device: String,
      ip: String,
      userAgent: String,
      createdAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      isActive: { type: Boolean, default: true }
    }],

    // Log de actividades
    activityLog: [{
      action: String,
      description: String,
      ip: String,
      userAgent: String,
      timestamp: { type: Date, default: Date.now },
      metadata: mongoose.Schema.Types.Mixed
    }]
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastPasswordChange: Date

}, { timestamps: true });

// Virtuals
userSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Middleware - Hash de password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.lastPasswordChange = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Métodos de instancia
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateVerificationCode = function() {
  this.verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  this.verificationCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return this.verificationCode;
};

userSchema.methods.generateStudentQRCode = function() {
  this.profile.student.qrCode = 'STU_' + crypto.randomBytes(8).toString('hex').toUpperCase();
  return this.profile.student.qrCode;
};

userSchema.methods.updateLocation = function(lat, lng, accuracy = 10) {
  this.profile.currentLocation = {
    latitude: lat,
    longitude: lng,
    timestamp: new Date(),
    accuracy
  };
  this.profile.lastSeen = new Date();
  return this.save();
};

userSchema.methods.logActivity = function(action, description = '', metadata = {}, req = null) {
  const activity = {
    action,
    description,
    timestamp: new Date(),
    metadata
  };

  if (req) {
    activity.ip = req.ip;
    activity.userAgent = req.get('User-Agent');
  }

  this.profile.activityLog.unshift(activity);

  if (this.profile.activityLog.length > 100) {
    this.profile.activityLog = this.profile.activityLog.slice(0, 100);
  }

  return this.save();
};

userSchema.methods.addDevice = function(token, type, name) {
  this.profile.devices.forEach(d => {
    if (d.type === type && d.isActive) d.isActive = false;
  });
  this.profile.devices.push({
    token,
    type,
    name,
    lastUsed: new Date(),
    isActive: true
  });
  return this.save();
};

userSchema.methods.createSession = function(token, device, req = null) {
  const session = {
    token,
    device,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true
  };

  if (req) {
    session.ip = req.ip;
    session.userAgent = req.get('User-Agent');
  }

  this.profile.sessions.push(session);
  this.profile.sessions = this.profile.sessions.filter(
    s => s.isActive && s.expiresAt > new Date()
  );

  return this.save();
};

userSchema.methods.getPublicProfile = function() {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.profile.sessions;
  delete userObj.profile.devices;
  delete userObj.verificationCode;
  delete userObj.verificationCodeExpiry;

  if (this.role === 'student') {
    delete userObj.profile.parent;
    delete userObj.profile.driver;
  }

  if (this.role === 'parent') {
    delete userObj.profile.driver;
    delete userObj.profile.student;
  }

  if (this.role === 'driver') {
    delete userObj.profile.parent;
    delete userObj.profile.student;
  }

  return userObj;
};

userSchema.methods.verifyEmail = function() {
  this.isVerified = true;
  this.verificationCode = undefined;
  this.verificationCodeExpiry = undefined;
  return this.save();
};

// Índices para mejor rendimiento
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ 'profile.student.qrCode': 1 });
userSchema.index({ 'profile.assignedVehicle': 1 });
userSchema.index({ 'profile.assignedRoute': 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);