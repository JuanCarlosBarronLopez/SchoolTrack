import mongoose from 'mongoose';

const waypointSchema = new mongoose.Schema({
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
    index: true
  },

  name: {
    type: String,
    required: [true, 'El nombre del punto es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres']
  },

  description: {
    type: String,
    trim: true
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Las coordenadas son requeridas']
    }
  },

  address: {
    street: String,
    city: {
      type: String,
      default: 'San Juan del Río'
    },
    state: {
      type: String,
      default: 'Querétaro'
    },
    postalCode: String,
    country: {
      type: String,
      default: 'México'
    }
  },

  order: {
    type: Number,
    required: [true, 'El orden es requerido'],
    min: [1, 'El orden debe ser al menos 1']
  },

  type: {
    type: String,
    enum: {
      values: ['pickup', 'dropoff', 'intermediate', 'school', 'home'],
      message: 'Tipo de punto no válido'
    },
    default: 'intermediate'
  },

  estimatedArrivalTime: {
    type: Number, // minutos desde inicio de ruta
    min: 0
  },

  actualArrivalTime: {
    type: Number, // minutos desde inicio de ruta (real)
    min: 0
  },

  status: {
    type: String,
    enum: {
      values: ['pending', 'reached', 'passed', 'skipped'],
      message: 'Estado no válido'
    },
    default: 'pending'
  },

  students: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pickupDropoff: {
      type: String,
      enum: ['pickup', 'dropoff']
    },
    attended: {
      type: Boolean,
      default: false
    }
  }],

  contactPerson: {
    name: String,
    phone: String,
    email: String
  },

  notes: {
    type: String,
    trim: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices
waypointSchema.index({ route: 1, order: 1 });
waypointSchema.index({ 'location.coordinates': '2dsphere' });
waypointSchema.index({ type: 1 });

// Pre-save middleware
waypointSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Métodos
waypointSchema.methods.markAsReached = function() {
  this.status = 'reached';
  this.actualArrivalTime = new Date();
  return this.save();
};

waypointSchema.methods.markAsPassed = function() {
  this.status = 'passed';
  return this.save();
};

waypointSchema.methods.skipWaypoint = function() {
  this.status = 'skipped';
  return this.save();
};

waypointSchema.methods.addStudent = function(studentId, type) {
  const existing = this.students.find(s => s.studentId.toString() === studentId.toString());
  if (!existing) {
    this.students.push({
      studentId,
      pickupDropoff: type
    });
  }
  return this.save();
};

waypointSchema.methods.markStudentAttended = function(studentId) {
  const student = this.students.find(s => s.studentId.toString() === studentId.toString());
  if (student) {
    student.attended = true;
  }
  return this.save();
};

waypointSchema.methods.getStudents = function() {
  return this.students;
};

waypointSchema.methods.getAttendedStudents = function() {
  return this.students.filter(s => s.attended);
};

// Virtuals
waypointSchema.virtual('isComplete').get(function() {
  return this.status === 'passed';
});

waypointSchema.virtual('delayMinutes').get(function() {
  if (this.estimatedArrivalTime && this.actualArrivalTime) {
    return this.actualArrivalTime - this.estimatedArrivalTime;
  }
  return null;
});

waypointSchema.virtual('isDelayed').get(function() {
  const delay = this.delayMinutes;
  return delay ? delay > 5 : false; // 5 minutos de tolerancia
});

waypointSchema.virtual('attendanceRate').get(function() {
  if (this.students.length === 0) return 0;
  const attended = this.students.filter(s => s.attended).length;
  return Math.round((attended / this.students.length) * 100);
});

export default mongoose.model('Waypoint', waypointSchema);
