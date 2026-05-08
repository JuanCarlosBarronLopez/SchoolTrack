import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  // Información del vehículo
  licensePlate: {
    type: String,
    required: [true, 'La placa de licencia es requerida'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  model: {
    type: String,
    required: [true, 'El modelo es requerido'],
    trim: true
  },
  
  brand: {
    type: String,
    required: [true, 'La marca es requerida'],
    trim: true
  },
  
  year: {
    type: Number,
    required: [true, 'El año es requerido'],
    min: [1990, 'El año debe ser 1990 o posterior'],
    max: [new Date().getFullYear() + 1, 'El año no puede ser futuro']
  },
  
  color: {
    type: String,
    required: [true, 'El color es requerido'],
    trim: true
  },
  
  vin: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },

  // Capacidad y características
  capacity: {
    type: Number,
    required: [true, 'La capacidad es requerida'],
    min: [1, 'Debe tener al menos 1 asiento'],
    max: [100, 'No puede tener más de 100 asientos']
  },
  
  seatingArrangement: {
    front: { type: Number, default: 2 },
    middle: { type: Number, default: 0 },
    back: { type: Number, default: 0 }
  },

  // Combustible y emisiones
  fuelType: {
    type: String,
    enum: {
      values: ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg'],
      message: 'Tipo de combustible no válido'
    },
    default: 'gasoline'
  },
  
  fuelConsumption: {
    city: Number,
    highway: Number,
    average: Number
  },
  
  emissions: {
    class: String,
    co2PerKm: Number
  },

  // Estado del vehículo
  status: {
    type: String,
    enum: {
      values: ['active', 'maintenance', 'inactive', 'out_of_service', 'retired'],
      message: 'Estado no válido'
    },
    default: 'active'
  },

  // Ubicación en tiempo real
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0]
    },
    timestamp: { type: Date, default: Date.now },
    accuracy: { type: Number, default: 10 },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 }
  },

  // Asignación
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El conductor es requerido']
  },
  
  backupDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },

  // Características de seguridad
  features: {
    ac: { type: Boolean, default: false },
    heating: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    gps: { type: Boolean, default: true },
    dashcam: { type: Boolean, default: false },
    backupCamera: { type: Boolean, default: false },
    speedLimiter: { type: Boolean, default: false },
    emergencyButton: { type: Boolean, default: true },
    fireExtinguisher: { type: Boolean, default: true },
    firstAidKit: { type: Boolean, default: true },
    seatbelts: { type: Boolean, default: true },
    childSeats: { type: Number, default: 0 },
    wheelchair_access: { type: Boolean, default: false }
  },

  // Mantenimiento
  maintenance: {
    lastServiceDate: Date,
    nextServiceDate: Date,
    lastMajorRepair: Date,
    totalMiles: { type: Number, default: 0 },
    milesSinceService: { type: Number, default: 0 },
    notes: String,
    schedule: [{
      date: Date,
      type: {
        type: String,
        enum: ['routine', 'repair', 'inspection', 'replacement']
      },
      description: String,
      cost: Number,
      completedDate: Date,
      status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled'
      }
    }]
  },

  // Odómetro y combustible
  odometer: {
    current: { type: Number, min: 0 },
    lastRecorded: Date,
    totalLifetime: { type: Number, min: 0 }
  },

  fuelLevel: {
    current: { type: Number, min: 0, max: 100 },
    capacity: Number,
    lastFilled: Date
  },

  // Seguros
  insurance: {
    company: String,
    policyNumber: String,
    expiryDate: Date,
    coverage: String,
    premium: Number,
    status: {
      type: String,
      enum: ['active', 'expired', 'pending'],
      default: 'active'
    }
  },

  // Registro y documentación
  registration: {
    registrationNumber: String,
    expiryDate: Date,
    owner: String,
    status: {
      type: String,
      enum: ['valid', 'expired', 'pending'],
      default: 'valid'
    }
  },

  // Inspecciones de seguridad
  safetyInspection: {
    lastInspectionDate: Date,
    nextInspectionDate: Date,
    inspectionNotes: String,
    status: {
      type: String,
      enum: ['pass', 'fail', 'pending', 'needs_attention'],
      default: 'pending'
    },
    checklist: [{
      item: String,
      status: { type: String, enum: ['ok', 'issue', 'na'] },
      notes: String,
      inspectedDate: Date
    }]
  },

  // Historial de viajes
  tripHistory: [{
    date: Date,
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    startTime: Date,
    endTime: Date,
    distance: Number,
    duration: Number,
    fuelUsed: Number,
    incidents: [String],
    rating: { type: Number, min: 1, max: 5 }
  }],

  // Rastreo de activos
  gpsTracking: {
    enabled: { type: Boolean, default: true },
    deviceId: String,
    lastPingTime: Date,
    batteryLevel: Number,
    signalStrength: Number
  },

  // Documentos
  documents: [{
    type: {
      type: String,
      enum: ['license', 'insurance', 'inspection', 'registration', 'other']
    },
    url: String,
    uploadDate: { type: Date, default: Date.now },
    expiryDate: Date
  }],

  // Notas y comentarios
  notes: String,

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Índice geoespacial para búsqueda de proximidad
vehicleSchema.index({ currentLocation: '2dsphere' });

// Otros índices
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ vin: 1 });
vehicleSchema.index({ driver: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ assignedRoute: 1 });
vehicleSchema.index({ createdAt: -1 });

// Virtuals
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.brand} ${this.model}`;
});

vehicleSchema.virtual('occupancyPercentage').get(function() {
  if (this.tripHistory.length === 0) return 0;
  const lastTrip = this.tripHistory[this.tripHistory.length - 1];
  return lastTrip.students ? (lastTrip.students.length / this.capacity) * 100 : 0;
});

// Métodos de instancia
vehicleSchema.methods.updateLocation = function(latitude, longitude, accuracy = 10, speed = 0, heading = 0) {
  this.currentLocation.coordinates = [longitude, latitude];
  this.currentLocation.timestamp = new Date();
  this.currentLocation.accuracy = accuracy;
  this.currentLocation.speed = speed;
  this.currentLocation.heading = heading;
  return this.save();
};

vehicleSchema.methods.recordTrip = function(route, driver, students, startTime, endTime, distance, fuelUsed, rating) {
  this.tripHistory.push({
    date: new Date(),
    route,
    driver,
    students,
    startTime,
    endTime,
    distance,
    duration: (endTime - startTime) / (1000 * 60), // en minutos
    fuelUsed,
    rating
  });
  return this.save();
};

vehicleSchema.methods.scheduleMaintenances = function(type, description, scheduledDate) {
  this.maintenance.schedule.push({
    date: scheduledDate,
    type,
    description,
    status: 'scheduled'
  });
  return this.save();
};

vehicleSchema.methods.completeMaintenance = function(maintenanceId) {
  const maintenance = this.maintenance.schedule.find(m => m._id.equals(maintenanceId));
  if (maintenance) {
    maintenance.status = 'completed';
    maintenance.completedDate = new Date();
  }
  return this.save();
};

vehicleSchema.methods.updateOdometer = function(miles) {
  this.odometer.current = miles;
  this.odometer.lastRecorded = new Date();
  this.odometer.totalLifetime = miles;
  return this.save();
};

vehicleSchema.methods.updateFuelLevel = function(percentage) {
  this.fuelLevel.current = percentage;
  if (percentage >= 80) {
    this.fuelLevel.lastFilled = new Date();
  }
  return this.save();
};

export default mongoose.model('Vehicle', vehicleSchema);