import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['pickup', 'dropoff', 'both'],
    default: 'both'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'temporary'],
    default: 'active'
  },
  estimatedDuration: {
    type: Number, // en minutos
    min: 0
  },
  totalDistance: {
    type: Number, // en kilómetros
    min: 0
  },
  school: {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    coordinates: { // <-- Modelo GeoJSON (que ya tenías)
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [Longitude, Latitude]
        required: true
      }
    }
  },
  
  // ======================================
  //  INICIO DE LA CORRECCIÓN
  // ======================================
  // El array 'stops' debe ser de objetos,
  // donde cada objeto tiene una 'stop' (ID) y un 'order' (Número)
  stops: [{
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop'
    },
    order: {
      type: Number,
      required: true
    }
  }],
  // ======================================
  //  FIN DE LA CORRECCIÓN
  // ======================================

  assignedVehicles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  }],
  schedule: {
    pickupTime: String, // HH:MM format
    dropoffTime: String, // HH:MM format
    activeDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  geometry: {
    type: {
      type: String,
      enum: ['LineString']
    },
    coordinates: [[Number]] // [longitude, latitude]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Índice para búsquedas geoespaciales
routeSchema.index({ 'school.coordinates': '2dsphere' });
routeSchema.index({ geometry: '2dsphere' });

export default mongoose.model('Route', routeSchema);