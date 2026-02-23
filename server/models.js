const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProfileSchema = new Schema({
  email: { type: String, required: true, unique: true },
  full_name: { type: String, default: null },
  avatar_filename: { type: String, default: null },
  created_at: { type: Date, default: () => new Date().toISOString() },
  updated_at: { type: Date, default: () => new Date().toISOString() }
});

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
  created_at: { type: Date, default: () => new Date().toISOString() }
});

const UserRoleSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  role: { type: String, enum: ['admin', 'student', 'parent', 'driver', 'user'], required: true },
  created_at: { type: Date, default: () => new Date().toISOString() }
});

const StudentSchema = new Schema({
  student_code: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  date_of_birth: { type: String, default: null },
  grade: { type: String, default: null },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  emergency_contact: { type: String, default: null },
  emergency_phone: { type: String, default: null },
  enrollment_date: { type: String, default: () => new Date().toISOString() },
  status: { type: String, default: 'active' },
  user_id: { type: Schema.Types.ObjectId, ref: 'Profile', default: null },
  created_at: { type: Date, default: () => new Date().toISOString() }
});

const VehicleSchema = new Schema({
  capacity: { type: Number, default: 0 },
  driver_id: { type: Schema.Types.ObjectId, ref: 'Profile', default: null },
  plate_number: { type: String, default: '' },
  status: { type: String, default: 'active' },
  vehicle_number: { type: String, default: '' },
  created_at: { type: Date, default: () => new Date().toISOString() }
});

const RouteSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: null },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  status: { type: String, default: 'active' },
  vehicle_id: { type: Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  created_at: { type: Date, default: () => new Date().toISOString() }
});

const LocationTrackingSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracy: { type: Number, default: null },
  timestamp: { type: String, default: () => new Date().toISOString() },
  created_at: { type: Date, default: () => new Date().toISOString() }
});

module.exports = {
  Profile: mongoose.model('Profile', ProfileSchema),
  User: mongoose.model('User', UserSchema),
  UserRole: mongoose.model('UserRole', UserRoleSchema),
  Student: mongoose.model('Student', StudentSchema),
  Vehicle: mongoose.model('Vehicle', VehicleSchema),
  Route: mongoose.model('Route', RouteSchema),
  LocationTracking: mongoose.model('LocationTracking', LocationTrackingSchema),
};
