import QRCode from 'qrcode';
import QRCodeModel from '../models/QRCode.js';
import Trip from '../models/Trip.js';
import TripCheckin from '../models/TripCheckin.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Route from '../models/Route.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Generar QR para un viaje
 * @route   GET /api/qr/generate/:tripId
 * @access  Private/Admin/Driver
 */
export const generateQR = asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  const trip = await Trip.findById(tripId).populate('route vehicle driver');

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Viaje no encontrado'
    });
  }

  // Verificar si ya existe un QR para este viaje
  let qrCode = await QRCodeModel.findOne({ trip: tripId });

  if (qrCode && !qrCode.isExpired()) {
    return res.json({
      success: true,
      message: 'QR code ya existe para este viaje',
      data: qrCode
    });
  }

  // Generar nuevo código único
  const code = `TRIP_${trip._id.toString().slice(-8).toUpperCase()}_${Date.now()}`;

  // Generar imagen QR
  const qrImage = await QRCode.toDataURL(code, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 0.95,
    margin: 1,
    width: 300
  });

  // Crear documento QR
  const newQR = new QRCodeModel({
    code,
    trip: tripId,
    vehicle: trip.vehicle._id,
    route: trip.route._id,
    driver: trip.driver || null,
    qrImage,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
  });

  await newQR.save();

  res.status(201).json({
    success: true,
    message: 'QR generado exitosamente',
    data: {
      code: newQR.code,
      qrImage: newQR.qrImage,
      expiresAt: newQR.expiresAt,
      checkinsCount: newQR.getCheckinCount()
    }
  });
});
    }
    
    // Generar código QR único
    // const qrCode = student.generateQRCode(); // Asumiendo que esta función existe en el modelo
    
    // Fallback por si student.generateQRCode() no existe:
    const qrCode = `STU_${student._id}_${Date.now()}`;

    student.qrCode = qrCode;
    await student.save();
    
    res.json({
      message: 'Código QR generado exitosamente',
      student: {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        studentId: student.studentId,
        qrCode: qrCode
      }
    });
  } catch (error) {
    console.error('Error generando QR de estudiante:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const generateDriverQR = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    if (req.user.role !== 'admin' && req.user.role !== 'school_admin') {
      return res.status(403).json({ 
        message: 'No tienes permisos para generar códigos QR' 
      });
    }
    
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Conductor no encontrado' });
    }
    
    const qrCode = `DRV_${driver._id}_${Date.now()}`;
    
    // Guardar en el perfil del conductor (asumiendo que tiene un campo 'qrCode')
    // await User.findByIdAndUpdate(driverId, { 'profile.driver.qrCode': qrCode });
    
    res.json({
      message: 'Código QR de conductor generado exitosamente',
      driver: {
        _id: driver._id,
        name: driver.name,
        email: driver.email,
        qrCode: qrCode
      }
    });
  } catch (error) {
    console.error('Error generando QR de conductor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const scanStudentQR = async (req, res) => {
  try {
    const { qrCode, vehicleId, action } = req.body; // action: 'pickup' o 'dropoff'
    const driver = req.user;

    if (!qrCode || !vehicleId || !action) {
      return res.status(400).json({ 
        message: 'qrCode, vehicleId y action son requeridos' 
      });
    }

    const student = await Student.findOne({ qrCode }).populate('parent');
    if (!student) {
      return res.status(404).json({ message: 'QR inválido o estudiante no encontrado' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }
    
    // Verificar que el conductor esté asignado a este vehículo
    if (vehicle.driver.toString() !== driver._id.toString()) {
       return res.status(403).json({ 
         message: 'No estás autorizado para escanear en este vehículo' 
       });
    }
    
    let message = '';
    let newStatus = '';
    
    if (action === 'pickup') {
      // Lógica de recogida
      student.currentStatus.status = 'transport';
      student.currentStatus.lastUpdate = new Date();
      student.currentStatus.lastSeenAt = vehicle.licensePlate;
      student.assignedVehicle = vehicle._id; // Asignar vehículo actual
      newStatus = 'transport';
      message = `${student.firstName} ha sido recogido por el vehículo ${vehicle.licensePlate}.`;

    } else if (action === 'dropoff') {
      // Lógica de entrega
      student.currentStatus.status = 'school'; // O 'home' dependiendo del destino
      student.currentStatus.lastUpdate = new Date();
      student.currentStatus.lastSeenAt = 'Destino (Escuela/Casa)';
      student.assignedVehicle = null; // Desasignar vehículo
      newStatus = 'school';
      message = `${student.firstName} ha sido entregado exitosamente.`;
      
    } else {
      return res.status(400).json({ message: 'Acción inválida (debe ser pickup o dropoff)' });
    }

    await student.save();

    // Enviar notificación a los padres
    if (student.parent) {
      await sendNotificationToParents(student, vehicle, driver, action);
    }
    
    res.json({
      success: true,
      message: message,
      student: {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        status: newStatus
      }
    });

  } catch (error) {
    console.error('Error escaneando QR de estudiante:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const scanDriverQR = async (req, res) => {
  try {
    const { qrCode, vehicleId } = req.body;
    const scanningDriver = req.user; // El conductor que está escaneando

    // Esta lógica es conceptual. 
    // Asume que un conductor escanea el QR de otro conductor para un relevo.
    // O un admin escanea a un conductor.
    
    const driver = await User.findOne({ 'profile.driver.qrCode': qrCode });
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'QR inválido o conductor no encontrado' });
    }
    
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    // Asignar conductor al vehículo
    vehicle.driver = driver._id;
    await vehicle.save();
    
    // Asignar vehículo al conductor
    driver.assignedVehicle = vehicle._id;
    await driver.save();
    
    res.json({
      success: true,
      message: `Conductor ${driver.name} asignado al vehículo ${vehicle.licensePlate}.`,
      driver: {
        _id: driver._id,
        name: driver.name
      },
      vehicle: {
        _id: vehicle._id,
        licensePlate: vehicle.licensePlate
      }
    });
    
  } catch (error) {
    console.error('Error escaneando QR de conductor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const getStudentsInVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const students = await Student.find({ 
      assignedVehicle: vehicleId,
      'currentStatus.status': 'transport'
    })
    .select('firstName lastName studentId grade avatar currentStatus')
    .sort({ lastName: 1 });

    if (!students) {
      return res.status(404).json({ message: 'No se encontraron estudiantes en este vehículo' });
    }
    
    res.json({
      success: true,
      count: students.length,
      students: students
    });
    
  } catch (error) {
    console.error('Error obteniendo estudiantes en vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


// --- Función Helper (Local) ---
// (Esta función no se exporta, solo se usa aquí dentro)
async function sendNotificationToParents(student, vehicle, driver, action) {
  try {
    const parent = student.parent;
    if (!parent || !parent.isActive) {
      console.log('No se pudo notificar: Padre no encontrado o inactivo.');
      return;
    }

    // Verificar preferencias de notificación
    if (action === 'pickup' && !parent.profile?.parent?.notificationSettings?.pickup) {
      return; // El padre desactivó esta notificación
    }
    if (action === 'dropoff' && !parent.profile?.parent?.notificationSettings?.dropoff) {
      return; // El padre desactivó esta notificación
    }
    
    const route = await Route.findById(vehicle.assignedRoute).select('name');
    const studentName = `${student.firstName} ${student.lastName}`;
    const driverName = driver.name || `${driver.firstName} ${driver.lastName}`;
    const vehicleInfo = `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`;

    let message = '';
    let notificationType = '';

    if (action === 'pickup') {
      message = `¡Hola! ${studentName} acaba de abordar el vehículo ${vehicleInfo}, conducido por ${driverName}.`;
      notificationType = 'student_pickup';
    } else {
      message = `¡Buenas noticias! ${studentName} ha llegado a su destino (${route?.name || 'Escuela/Casa'}).`;
      notificationType = 'student_dropoff';
    }
    
    // Crear notificación (Aquí iría tu lógica real de notificaciones)
    console.log(`[SIMULACIÓN DE NOTIFICACIÓN] Para: ${parent.email}`);
    console.log(`  Tipo: ${notificationType}`);
    console.log(`  Mensaje: ${message}`);
    
    // Aquí se integraría con tu notificationService
    // notificationService.queueNotification({ ... });
    
  } catch (error) {
    console.error('Error enviando notificación a padres:', error);
  }
}

// ======================================
//  INICIO DE LA CORRECCIÓN
// ======================================
// Ahora exportamos un objeto que SÍ contiene
// las constantes locales que definimos arriba.

module.exports = {
  generateStudentQR,
  generateDriverQR,
  scanStudentQR,
  scanDriverQR,
  getStudentsInVehicle
};