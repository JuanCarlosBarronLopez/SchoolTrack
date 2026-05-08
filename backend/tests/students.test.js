import { jest } from '@jest/globals';
import supertest from 'supertest';
import { connect, closeDatabase, clearDatabase } from './helpers/dbHandler.js';
import { createApp } from './helpers/appFactory.js';
import Student from '../src/models/Student.js';
import User from '../src/models/User.js';

let app;
let request;

beforeAll(async () => {
  await connect();
  app = createApp();
  request = supertest(app);
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

/**
 * Helper: create a parent user directly in DB
 */
async function createParentUser(email = 'parent@test.com') {
  return User.create({
    firstName: 'Padre',
    lastName: 'TestUser',
    email,
    password: 'password123',
    role: 'parent'
  });
}

// ==================== MODELO STUDENT ====================

describe('Student Model', () => {
  it('debe crear un estudiante con datos válidos', async () => {
    const parent = await createParentUser('padre.modelo@test.com');

    const student = await Student.create({
      firstName: 'Luis',
      lastName: 'García',
      parent: parent._id,
      grade: '5th',
      emergencyContact: {
        name: 'Padre Modelo',
        phone: '555-9999',
        relationship: 'Parent'
      }
    });

    expect(student).toBeDefined();
    expect(student.firstName).toBe('Luis');
    expect(student.lastName).toBe('García');
    expect(student.studentId).toBeDefined();
    expect(student.qrCode).toBeDefined();
    expect(student.isActive).toBe(true);
    expect(student.status).toBe('enrolled');
  });

  it('debe rechazar estudiante sin nombre', async () => {
    const parent = await createParentUser('noname@test.com');

    await expect(Student.create({
      lastName: 'Solo Apellido',
      parent: parent._id,
      emergencyContact: { name: 'Contact', phone: '555-111', relationship: 'Parent' }
    })).rejects.toThrow();
  });

  it('debe rechazar estudiante sin padre', async () => {
    await expect(Student.create({
      firstName: 'Sinpadre',
      lastName: 'Testeo',
      emergencyContact: { name: 'Contact', phone: '555-111', relationship: 'Parent' }
    })).rejects.toThrow();
  });

  it('debe generar studentId y qrCode automáticamente', async () => {
    const parent = await createParentUser('autogen@test.com');

    const student = await Student.create({
      firstName: 'AutoGen',
      lastName: 'Generated',
      parent: parent._id,
      emergencyContact: { name: 'Contact', phone: '555-111', relationship: 'Parent' }
    });

    expect(student.studentId).toMatch(/^STU-/);
    expect(student.qrCode).toMatch(/^SCHTRK_STU_/);
  });

  it('debe calcular el fullName virtual', async () => {
    const parent = await createParentUser('virtual@test.com');

    const student = await Student.create({
      firstName: 'Virtual',
      lastName: 'Testeo',
      parent: parent._id,
      emergencyContact: { name: 'Contact', phone: '555-111', relationship: 'Parent' }
    });

    expect(student.fullName).toBe('Virtual Testeo');
  });

  it('debe actualizar status del estudiante', async () => {
    const parent = await createParentUser('status@test.com');

    const student = await Student.create({
      firstName: 'Status',
      lastName: 'Testeo',
      parent: parent._id,
      emergencyContact: { name: 'Contact', phone: '555-111', relationship: 'Parent' }
    });

    await student.updateStatus('school', 'Edificio A');
    const updated = await Student.findById(student._id);

    expect(updated.currentStatus.status).toBe('school');
    expect(updated.currentStatus.lastSeenAt).toBe('Edificio A');
    expect(updated.currentStatus.lastUpdate).toBeDefined();
  });

  it('debe marcar asistencia', async () => {
    const parent = await createParentUser('attendance@test.com');

    const student = await Student.create({
      firstName: 'Attendance',
      lastName: 'Testeo',
      parent: parent._id,
      emergencyContact: { name: 'Contact', phone: '555-111', relationship: 'Parent' }
    });

    await student.markAttendance('present', 'Llegó a tiempo');
    const updated = await Student.findById(student._id);

    expect(updated.attendance.length).toBe(1);
    expect(updated.attendance[0].status).toBe('present');
    expect(updated.attendance[0].notes).toBe('Llegó a tiempo');
  });
});

// ==================== VALIDACIÓN DE DATOS MÉDICOS ====================

describe('Student Medical Info', () => {
  it('debe almacenar información médica completa', async () => {
    const parent = await createParentUser('medical@test.com');

    const student = await Student.create({
      firstName: 'Medical',
      lastName: 'Student',
      parent: parent._id,
      emergencyContact: { name: 'Contact', phone: '555-111', relationship: 'Parent' },
      medicalInfo: {
        allergies: ['Maní', 'Leche'],
        medications: ['Ventolin'],
        bloodType: 'A+',
        specialNeeds: 'Asma leve'
      }
    });

    expect(student.medicalInfo.allergies).toHaveLength(2);
    expect(student.medicalInfo.bloodType).toBe('A+');
    expect(student.medicalInfo.specialNeeds).toBe('Asma leve');
  });

  it('debe rechazar tipo de sangre inválido', async () => {
    const parent = await createParentUser('blood@test.com');

    await expect(Student.create({
      firstName: 'Blood',
      lastName: 'Testeo',
      parent: parent._id,
      emergencyContact: { name: 'Contact', phone: '555-111', relationship: 'Parent' },
      medicalInfo: { bloodType: 'XYZ' }
    })).rejects.toThrow();
  });
});
