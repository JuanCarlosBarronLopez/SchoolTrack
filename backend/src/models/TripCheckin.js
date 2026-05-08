import mongoose from 'mongoose';

const tripCheckinSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    index: true
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  checkInType: {
    type: String,
    enum: {
      values: ['pickup', 'dropoff'],
      message: 'Tipo de check-in no válido'
    },
    required: true
  },

  method: {
    type: String,
    enum: {
      values: ['qrcode', 'manual', 'rfid', 'gps_auto'],
      message: 'Método de check-in no válido'
    },
    default: 'manual'
  },

  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      sparse: true
    }
  },

  accuracy: {
    type: Number, // metros
    sparse: true
  },

  waypoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waypoint',
    sparse: true
  },

  qrCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode',
    sparse: true
  },

  verified: {
    type: Boolean,
    default: true
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },

  verifiedAt: {
    type: Date,
    sparse: true
  },

  notes: {
    type: String,
    trim: true
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },

  notificationSent: {
    type: Boolean,
    default: false
  },

  notificationSentAt: {
    type: Date,
    sparse: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices
tripCheckinSchema.index({ trip: 1, student: 1 });
tripCheckinSchema.index({ 'location.coordinates': '2dsphere' });
tripCheckinSchema.index({ timestamp: 1 });
tripCheckinSchema.index({ checkInType: 1 });

// Pre-save middleware
tripCheckinSchema.pre('save', function(next) {
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  next();
});

// Métodos
tripCheckinSchema.methods.verify = function(verifiedBy) {
  this.verified = true;
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();
  return this.save();
};

tripCheckinSchema.methods.getDistanceFromPoint = function(lat, lng) {
  if (!this.location || !this.location.coordinates) {
    return null;
  }

  const [checkLng, checkLat] = this.location.coordinates;
  const R = 6371; // Radio de la Tierra en km

  const dLat = (lat - checkLat) * (Math.PI / 180);
  const dLng = (lng - checkLng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(checkLat * (Math.PI / 180)) *
      Math.cos(lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance * 1000; // metros
};

tripCheckinSchema.methods.markNotificationSent = function() {
  this.notificationSent = true;
  this.notificationSentAt = new Date();
  return this.save();
};

// Virtuals
tripCheckinSchema.virtual('delayMinutes').get(function() {
  // Se calcula en base a si pasó la hora estimada
  return 0; // TODO: implementar lógica completa
});

tripCheckinSchema.virtual('isOnTime').get(function() {
  return this.delayMinutes <= 5; // 5 minutos de tolerancia
});

export default mongoose.model('TripCheckin', tripCheckinSchema);
