import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Compatibilidad con datos antiguos
  coordinates: {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 }
  },

  // Nuevo formato GeoJSON para mapas y consultas espaciales
  coords: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },

  altitude: { type: Number, default: 0 },
  speed: { type: Number, min: 0, default: 0 },
  heading: { type: Number, min: 0, max: 360, default: 0 },
  accuracy: { type: Number, min: 0, default: 10 },
  timestamp: { type: Date, default: Date.now, required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  status: { type: String, enum: ['moving', 'stopped', 'idle', 'maintenance'], default: 'moving' },
  batteryLevel: { type: Number, min: 0, max: 100 },
  signalStrength: { type: Number, min: 0, max: 100 },
  metadata: {
    ignition: Boolean,
    doors: [String],
    temperature: Number,
    fuelLevel: Number
  }
}, {
  timestamps: true
});

// Índices optimizados
locationSchema.index({ vehicle: 1, timestamp: -1 });
locationSchema.index({ coords: '2dsphere' });
locationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model('Location', locationSchema);