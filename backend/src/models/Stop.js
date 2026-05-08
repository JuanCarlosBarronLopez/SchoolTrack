import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  
  // --- CORRECCIÓN GEOJSON ---
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [Longitude, Latitude]
      required: true
    }
  },
  // --- FIN DE CORRECCIÓN ---
  
  type: {
    type: String,
    enum: ['pickup', 'dropoff', 'both'],
    default: 'both'
  },
  estimatedArrivalTime: {
    type: String, // HH:MM format
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 0
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'temporary'],
    default: 'active'
  },
  pickupTimeWindow: {
    start: String, // HH:MM format
    end: String    // HH:MM format
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Índice para búsquedas geoespaciales
stopSchema.index({ coordinates: '2dsphere' });

export default mongoose.model('Stop', stopSchema);