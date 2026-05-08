import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: [true, 'El código QR es requerido'],
    trim: true
  },

  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    index: true
  },

  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },

  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  qrImage: {
    type: String, // Base64 encoded o URL
    trim: true
  },

  status: {
    type: String,
    enum: {
      values: ['active', 'used', 'expired', 'voided'],
      message: 'Estado de QR no válido'
    },
    default: 'active',
    index: true
  },

  expiresAt: {
    type: Date,
    required: true,
    index: true
  },

  checkins: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    verified: {
      type: Boolean,
      default: true
    }
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices geoespaciales
qrCodeSchema.index({ 'checkins.location': '2dsphere' });
qrCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Pre-save middleware
qrCodeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Métodos
qrCodeSchema.methods.addCheckin = function(studentId, location) {
  if (this.status !== 'active') {
    throw new Error('QR code no está activo');
  }

  if (new Date() > this.expiresAt) {
    this.status = 'expired';
    throw new Error('QR code ha expirado');
  }

  this.checkins.push({
    student: studentId,
    timestamp: new Date(),
    location: {
      type: 'Point',
      coordinates: [location.longitude, location.latitude]
    }
  });

  return this.save();
};

qrCodeSchema.methods.markAsUsed = function() {
  this.status = 'used';
  return this.save();
};

qrCodeSchema.methods.markAsVoided = function() {
  this.status = 'voided';
  return this.save();
};

qrCodeSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

qrCodeSchema.methods.getCheckinCount = function() {
  return this.checkins.length;
};

qrCodeSchema.methods.getApprovedCheckins = function() {
  return this.checkins.filter(c => c.verified);
};

// Virtuals
qrCodeSchema.virtual('isActive').get(function() {
  return this.status === 'active' && !this.isExpired();
});

qrCodeSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const diff = this.expiresAt.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

export default mongoose.model('QRCode', qrCodeSchema);
