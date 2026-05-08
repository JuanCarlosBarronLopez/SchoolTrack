import User from '../models/User.js';
import Student from '../models/Student.js';
import Vehicle from '../models/Vehicle.js';
import Route from '../models/Route.js';
import logger from '../utils/logger.js';

class NotificationService {
  constructor() {
    this.notificationQueue = [];
    this.processing = false;
  }

  async queueNotification(notification) {
    this.notificationQueue.push({ ...notification, id: Date.now() + Math.random(), attempts: 0, maxAttempts: 3, createdAt: new Date() });
    if (!this.processing) this.processQueue();
  }

  async processQueue() {
    this.processing = true;
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      try {
        await this.sendNotification(notification);
      } catch (error) {
        notification.attempts++;
        if (notification.attempts < notification.maxAttempts) this.notificationQueue.push(notification);
        else logger.error('Notificación fallida', { notification, error: error.message });
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.processing = false;
  }

  async sendNotification(notification) {
    const { recipients, title, message, data = {} } = notification;
    for (const recipient of recipients) {
      const user = await User.findById(recipient.userId);
      if (!user || !user.isActive) continue;
      if (user.notificationSettings?.push && recipient.methods.includes('push')) await this.sendPushNotification(user, title, message, data);
      if (user.notificationSettings?.email && recipient.methods.includes('email')) await this.sendEmailNotification(user, title, message, data);
      if (user.notificationSettings?.sms && recipient.methods.includes('sms') && user.phone) await this.sendSMSNotification(user, message, data);
    }
    await this.saveNotification(notification);
  }

  async sendPushNotification(user, title, message, data) {
    const activeDevices = user.getActiveDevices ? user.getActiveDevices() : [];
    for (const device of activeDevices) {
      if (process.env.NODE_ENV === 'development') logger.debug(`[PUSH] ${user.email} | ${title}`);
    }
  }

  async sendEmailNotification(user, title, message, data) {
    if (process.env.NODE_ENV === 'development') logger.debug(`[EMAIL] ${user.email} | ${title}`);
  }

  async sendSMSNotification(user, message, data) {
    if (!user.phone) return;
    if (process.env.NODE_ENV === 'development') logger.debug(`[SMS] ${user.phone} | ${message.substring(0, 50)}`);
  }

  async saveNotification(notification) {
    // TODO: Save to Notification collection
  }

  async notifyParentPickupDropoff(studentId, action, vehicleId, driverId) {
    try {
      const student = await Student.findById(studentId).populate('parent');
      if (!student || !student.parent) return;
      const vehicle = await Vehicle.findById(vehicleId);
      const driver = await User.findById(driverId);
      const route = vehicle ? await Route.findById(vehicle.assignedRoute) : null;
      const studentName = `${student.firstName} ${student.lastName}`;
      const driverName = driver ? `${driver.firstName} ${driver.lastName}` : 'Conductor';
      const vehicleInfo = vehicle ? `${vehicle.model} ${vehicle.brand} (${vehicle.licensePlate})` : 'Autobús';
      const title = action === 'pickup' ? '🚌 Estudiante en Camino' : '🏫 Estudiante en Destino';
      const message = action === 'pickup'
        ? `${studentName} ha subido al autobús. Conductor: ${driverName}. Vehículo: ${vehicleInfo}.`
        : `${studentName} ha llegado a la escuela.`;
      await this.queueNotification({ type: `student_${action}`, recipients: [{ userId: student.parent._id, methods: ['push', 'email'] }], title, message, data: { studentId, studentName, vehicleId, vehicleInfo, driverId, driverName, routeId: route?._id, routeName: route?.name, action, timestamp: new Date() } });
    } catch (error) { logger.error('Error notificando pickup/dropoff', { error: error.message }); }
  }

  async notifyDelay(recipients, routeId, estimatedDelay, reason) {
    try {
      const route = await Route.findById(routeId);
      const routeName = route ? route.name : 'Ruta desconocida';
      await this.queueNotification({ type: 'route_delay', recipients, title: '⚠️ Retraso en Ruta', message: `Retraso estimado de ${estimatedDelay} minutos en la ruta ${routeName}. ${reason || ''}`, data: { routeId, routeName, estimatedDelay, reason, timestamp: new Date() } });
    } catch (error) { logger.error('Error notificando retraso', { error: error.message }); }
  }

  async notifyEmergency(recipients, incidentType, location, description) {
    try {
      await this.queueNotification({ type: 'emergency', recipients, title: '🚨 Incidente Reportado', message: `Tipo: ${incidentType}. Ubicación: ${location}. ${description}`, data: { incidentType, location, description, timestamp: new Date(), priority: 'high' } });
    } catch (error) { logger.error('Error notificando emergencia', { error: error.message }); }
  }

  async notifyRouteChange(recipients, routeId, changes, reason) {
    try {
      const route = await Route.findById(routeId);
      const routeName = route ? route.name : 'Ruta desconocida';
      await this.queueNotification({ type: 'route_change', recipients, title: '🔄 Cambio de Ruta', message: `Cambio en ruta ${routeName}. Motivo: ${reason}`, data: { routeId, routeName, changes, reason, timestamp: new Date() } });
    } catch (error) { console.error('Error notificando cambio de ruta:', error); }
  }

  async notifyDailySummary(recipients, date, summary) {
    try {
      await this.queueNotification({ type: 'daily_summary', recipients, title: '📊 Resumen Diario', message: `Resumen del día ${date.toLocaleDateString()}: ${summary}`, data: { date, summary, timestamp: new Date() } });
    } catch (error) { console.error('Error notificando resumen diario:', error); }
  }
}

export default new NotificationService();