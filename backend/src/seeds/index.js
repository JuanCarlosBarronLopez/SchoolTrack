import connectDB from '../config/db.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Vehicle from '../models/Vehicle.js';
import Route from '../models/Route.js';
import Stop from '../models/Stop.js';
import Location from '../models/Location.js';
import mongoose from 'mongoose';

(async () => {
  await connectDB();
  console.log('🧹 Limpiando base de datos existente...');
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Vehicle.deleteMany({}),
    Route.deleteMany({}),
    Stop.deleteMany({}),
    Location.deleteMany({})
  ]);

  console.log('🌱 Insertando datos iniciales...');

  // Crear usuarios (conductores, padres, admin)
  const driver1 = await User.create({
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'driver1@schooltrack.com',
    password: 'driver123',
    role: 'driver',
    profile: {
      driver: { licenseNumber: 'D123456', licenseExpiry: new Date('2026-12-31'), experience: 5, vehicleType: 'School Bus' }
    }
  });
  const driver2 = await User.create({
    firstName: 'María',
    lastName: 'González',
    email: 'driver2@schooltrack.com',
    password: 'driver123',
    role: 'driver',
    profile: { driver: { licenseNumber: 'D789012', licenseExpiry: new Date('2027-01-15'), experience: 3, vehicleType: 'School Bus' } }
  });
  const parent1 = await User.create({
    firstName: 'Carlos',
    lastName: 'López',
    email: 'parent1@schooltrack.com',
    password: 'parent123',
    role: 'parent',
    profile: { parent: { preferredContactMethod: 'sms' } }
  });

  // Crear estudiantes
  const student1 = await Student.create({
    firstName: 'Ana',
    lastName: 'Martínez',
    parent: parent1._id,
    assignedSchool: 'Escuela Primaria Central',
    grade: '5to',
    dateOfBirth: new Date('2015-05-10'),
    emergencyContact: { name: 'Laura Martínez', phone: '555-0101', relationship: 'Madre' }
  });
  const student2 = await Student.create({
    firstName: 'Luis',
    lastName: 'García',
    parent: parent1._id,
    assignedSchool: 'Escuela Primaria Central',
    grade: '4to',
    dateOfBirth: new Date('2016-03-15'),
    emergencyContact: { name: 'Laura Martínez', phone: '555-0101', relationship: 'Madre' }
  });
  const student3 = await Student.create({
    firstName: 'Sofía',
    lastName: 'Hernández',
    parent: parent1._id,
    assignedSchool: 'Escuela Primaria Central',
    grade: '5to',
    dateOfBirth: new Date('2015-08-20'),
    emergencyContact: { name: 'Laura Martínez', phone: '555-0101', relationship: 'Madre' }
  });

  // Actualizar padre con hijos
  await User.findByIdAndUpdate(parent1._id, { $push: { 'profile.parent.children': { $each: [student1._id, student2._id, student3._id] } } });

  // Crear vehículos escolares
  const vehicle1 = await Vehicle.create({
    driver: driver1._id,
    color: 'Amarillo',
    year: 2020,
    brand: 'Blue Bird',
    licensePlate: 'SCH123',
    model: 'Vision',
    capacity: 40,
    currentLocation: { coordinates: [-100.316, 25.675] },
    features: ['ac', 'camera', 'gps'],
    fuelType: 'diesel',
    status: 'active'
  });
  const vehicle2 = await Vehicle.create({
    driver: driver2._id,
    color: 'Amarillo',
    year: 2019,
    brand: 'Thomas Built Buses',
    licensePlate: 'SCH456',
    model: 'Saf-T-Liner C2',
    capacity: 30,
    currentLocation: { coordinates: [-100.312, 25.671] },
    features: ['heating', 'camera'],
    fuelType: 'diesel',
    status: 'active'
  });
  const vehicle3 = await Vehicle.create({
    driver: driver1._id,
    color: 'Amarillo',
    year: 2021,
    brand: 'IC Bus',
    licensePlate: 'SCH789',
    model: 'CE Series',
    capacity: 35,
    currentLocation: { coordinates: [-100.310, 25.673] },
    features: ['wifi', 'gps'],
    fuelType: 'diesel',
    status: 'active'
  });

  // Crear paradas
  const stop1 = await Stop.create({
    name: 'Parada Escuela Primaria',
    address: 'Av. Central 123, Monterrey',
    coordinates: { coordinates: [-100.315, 25.674] },
    estimatedArrivalTime: '07:30',
    order: 1,
    route: null,
    students: [student1._id, student2._id]
  });
  const stop2 = await Stop.create({
    name: 'Parada Parque Sur',
    address: 'Calle Sur 456, Monterrey',
    coordinates: { coordinates: [-100.310, 25.670] },
    estimatedArrivalTime: '07:20',
    order: 0,
    route: null,
    students: [student3._id]
  });
  const stop3 = await Stop.create({
    name: 'Parada Residencial Norte',
    address: 'Av. Norte 789, Monterrey',
    coordinates: { coordinates: [-100.318, 25.676] },
    estimatedArrivalTime: '07:25',
    order: 2,
    route: null,
    students: [student1._id]
  });

  // Crear rutas
  const route1 = await Route.create({
    name: 'Ruta Escolar Matutina',
    code: 'RTM001',
    school: { name: 'Escuela Primaria Central', address: 'Av. Central 123', coordinates: { coordinates: [-100.315, 25.674] } },
    stops: [{ stop: stop1._id, order: 1 }, { stop: stop2._id, order: 0 }, { stop: stop3._id, order: 2 }],
    assignedVehicles: [vehicle1._id],
    schedule: { pickupTime: '07:00', activeDays: ['monday', 'wednesday', 'friday'] }
  });
  const route2 = await Route.create({
    name: 'Ruta Escolar Vespertina',
    code: 'RTV002',
    school: { name: 'Escuela Primaria Central', address: 'Av. Central 123', coordinates: { coordinates: [-100.315, 25.674] } },
    stops: [{ stop: stop1._id, order: 0 }, { stop: stop3._id, order: 1 }],
    assignedVehicles: [vehicle2._id],
    schedule: { dropoffTime: '14:30', activeDays: ['tuesday', 'thursday'] }
  });
  const route3 = await Route.create({
    name: 'Ruta Escolar Extra',
    code: 'RTX003',
    school: { name: 'Escuela Primaria Central', address: 'Av. Central 123', coordinates: { coordinates: [-100.315, 25.674] } },
    stops: [{ stop: stop2._id, order: 0 }],
    assignedVehicles: [vehicle3._id],
    schedule: { pickupTime: '08:00', activeDays: ['saturday'] }
  });

  // Actualizar paradas con rutas
  await Stop.updateMany({ _id: { $in: [stop1._id, stop2._id, stop3._id] } }, { $set: { route: route1._id } });

  // Crear ubicaciones
  const location1 = await Location.create({
    vehicle: vehicle1._id,
    driver: driver1._id,
    coordinates: { latitude: 25.675, longitude: -100.316 },
    coords: { coordinates: [-100.316, 25.675] },
    timestamp: new Date(),
    status: 'moving'
  });
  const location2 = await Location.create({
    vehicle: vehicle2._id,
    driver: driver2._id,
    coordinates: { latitude: 25.671, longitude: -100.312 },
    coords: { coordinates: [-100.312, 25.671] },
    timestamp: new Date(),
    status: 'stopped'
  });
  const location3 = await Location.create({
    vehicle: vehicle3._id,
    driver: driver1._id,
    coordinates: { latitude: 25.673, longitude: -100.310 },
    coords: { coordinates: [-100.310, 25.673] },
    timestamp: new Date(),
    status: 'idle'
  });

  // Actualizar vehículos y estudiantes con rutas y vehículos asignados
  await Vehicle.updateMany({ _id: { $in: [vehicle1._id, vehicle2._id, vehicle3._id] } }, { $set: { assignedRoute: route1._id } });
  await Student.updateMany({ _id: { $in: [student1._id, student2._id, student3._id] } }, { $set: { assignedRoute: route1._id, assignedVehicle: vehicle1._id } });

  console.log('✅ Base de datos poblada exitosamente!');
  process.exit(0);
})();