import mongoose from 'mongoose';
import crypto from 'crypto';

const studentSchema = new mongoose.Schema({
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
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El padre/tutor es requerido']
  },
  assignedSchool: {
    type: String,
    trim: true
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },

  // ID y Código QR
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },

  // Información académica
  grade: {
    type: String,
    enum: ['Kindergarten', 'Pre-K', '1st', '2nd', '3rd', '4th', '5th', '6th',
           '7th', '8th', '9th', '10th', '11th', '12th'],
    trim: true
  },
  section: String,
  academicYear: String,

  // Información personal
  dateOfBirth: Date,
  avatar: {
    type: String,
    default: '',
    trim: true
  },

  // Información de contacto de emergencia
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Nombre de contacto de emergencia requerido']
    },
    phone: {
      type: String,
      required: [true, 'Teléfono de contacto de emergencia requerido']
    },
    relationship: {
      type: String,
      enum: ['Parent', 'Guardian', 'Sibling', 'Other'],
      required: true
    }
  },

  // Información médica
  medicalInfo: {
    allergies: [String],
    medications: [String],
    specialNeeds: String,
    bloodType: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
    },
    insurance: {
      provider: String,
      policyNumber: String,
      expiryDate: Date
    },
    lastCheckup: Date,
    notes: String
  },

  // Estado actual
  currentStatus: {
    status: {
      type: String,
      enum: ['home', 'school', 'transport', 'absent', 'unknown'],
      default: 'unknown'
    },
    lastUpdate: Date,
    lastSeenAt: String,
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop' }
  },

  // Attendance
  attendance: [{
    date: Date,
    presentAt: Date,
    absentAt: Date,
    pickupTime: Date,
    dropoffTime: Date,
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'early_pickup'],
      default: 'present'
    },
    notes: String
  }],

  // Historial de rutas
  routeHistory: [{
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    }
  }],

  // Preferencias y configuración
  preferences: {
    pickupLocation: {
      address: String,
      latitude: Number,
      longitude: Number,
      accuracy: Number
    },
    dropoffLocation: {
      address: String,
      latitude: Number,
      longitude: Number,
      accuracy: Number
    },
    safeWordPickup: String,
    safeWordDropoff: String
  },

  // Estado del estudiante
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['enrolled', 'unenrolled', 'inactive', 'graduated'],
    default: 'enrolled'
  },

  // Notificaciones
  notificationPreferences: {
    parentPickupReminder: { type: Boolean, default: true },
    delayNotification: { type: Boolean, default: true },
    locationSharing: { type: Boolean, default: true },
    dailyStatus: { type: Boolean, default: false }
  },

  // Ratings y comentarios
  ratings: {
    safety: { type: Number, min: 1, max: 5 },
    behavior: [
      {
        date: Date,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ]
  },

  // Documentos
  documents: [{
    type: {
      type: String,
      enum: ['permission', 'medical', 'identification', 'other']
    },
    url: String,
    uploadDate: { type: Date, default: Date.now },
    expiryDate: Date
  }],

  // Timestamps
  enrollmentDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Generadores automáticos
studentSchema.pre('save', async function(next) {
  if (!this.studentId) {
    this.studentId = `STU-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  if (!this.qrCode) {
    this.qrCode = `SCHTRK_STU_${this._id.toString()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  next();
});

// Virtuals
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  let age = today.getFullYear() - this.dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())) {
    age--;
  }
  return age;
});

// Métodos de instancia
studentSchema.methods.markAttendance = function(status = 'present', notes = '') {
  this.attendance.push({
    date: new Date(),
    status,
    notes
  });
  if (status === 'present') {
    this.currentStatus.lastUpdate = new Date();
  }
  return this.save();
};

studentSchema.methods.updateStatus = function(status, lastSeenAt = '') {
  this.currentStatus.status = status;
  this.currentStatus.lastUpdate = new Date();
  this.currentStatus.lastSeenAt = lastSeenAt;
  return this.save();
};

studentSchema.methods.updateLocation = function(latitude, longitude, accuracy = 10) {
  if (this.preferences) {
    this.preferences.pickupLocation = { latitude, longitude, accuracy };
  }
  return this.save();
};

studentSchema.methods.assignRoute = function(routeId, vehicleId, driverId) {
  this.assignedRoute = routeId;
  this.assignedVehicle = vehicleId;
  this.currentStatus.driver = driverId;
  this.currentStatus.vehicle = vehicleId;

  this.routeHistory.push({
    route: routeId,
    vehicle: vehicleId,
    driver: driverId,
    startDate: new Date(),
    status: 'active'
  });

  return this.save();
};

studentSchema.methods.addBehaviorRating = function(rating, comment, driverId) {
  this.ratings.behavior.push({
    date: new Date(),
    rating,
    comment,
    driver: driverId
  });
  return this.save();
};

studentSchema.methods.getPublicProfile = function() {
  const profile = this.toObject();
  delete profile.__v;
  return profile;
};

// Índices para mejor rendimiento
studentSchema.index({ studentId: 1 });
studentSchema.index({ qrCode: 1 });
studentSchema.index({ parent: 1 });
studentSchema.index({ assignedRoute: 1 });
studentSchema.index({ assignedVehicle: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ isActive: 1 });
studentSchema.index({ enrollmentDate: -1 });
studentSchema.index({ 'currentStatus.status': 1 });

export default mongoose.model('Student', studentSchema);