import { jest } from '@jest/globals';
import supertest from 'supertest';
import { connect, closeDatabase, clearDatabase } from './helpers/dbHandler.js';
import { createApp } from './helpers/appFactory.js';

let app;
let request;
let adminToken;

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
 * Helper: create admin user and return token
 */
async function createAdminAndLogin() {
  const res = await request.post('/api/auth/register').send({
    firstName: 'Admin',
    lastName: 'Test',
    email: 'admin@test.com',
    password: 'admin123456',
    role: 'admin'
  });
  return res.body.token;
}

/**
 * Helper: create a driver user and return {token, userId}
 */
async function createDriver(email = 'driver@test.com') {
  const res = await request.post('/api/auth/register').send({
    firstName: 'Conductor',
    lastName: 'Test',
    email,
    password: 'driver123456',
    role: 'driver'
  });
  return { token: res.body.token, userId: res.body.user._id };
}

// ==================== CREAR VEHÍCULO ====================

describe('POST /api/vehicles', () => {
  let driverData;

  beforeEach(async () => {
    adminToken = await createAdminAndLogin();
    driverData = await createDriver();
  });

  const buildVehicle = (driverId) => ({
    licensePlate: 'ABC-1234',
    model: 'Sprinter',
    brand: 'Mercedes-Benz',
    year: 2023,
    color: 'Blanco',
    capacity: 30,
    driver: driverId
  });

  it('debe crear un vehículo exitosamente', async () => {
    const vehicleData = buildVehicle(driverData.userId);

    const res = await request
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(vehicleData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('vehicle');
    expect(res.body.vehicle.licensePlate).toBe('ABC-1234');
    expect(res.body.vehicle.brand).toBe('Mercedes-Benz');
    expect(res.body.message).toContain('exitosamente');
  });

  it('debe rechazar vehículo sin placa', async () => {
    const vehicleData = buildVehicle(driverData.userId);
    delete vehicleData.licensePlate;

    const res = await request
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(vehicleData);

    expect(res.status).toBe(400);
  });

  it('debe rechazar vehículo con año inválido', async () => {
    const vehicleData = buildVehicle(driverData.userId);
    vehicleData.year = 1980;

    const res = await request
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(vehicleData);

    expect(res.status).toBe(400);
  });

  it('debe rechazar placa duplicada', async () => {
    const vehicleData = buildVehicle(driverData.userId);
    await request
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(vehicleData);

    // Second driver for second vehicle
    const driver2 = await createDriver('driver2@test.com');
    vehicleData.driver = driver2.userId;

    const res = await request
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(vehicleData);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('placa');
  });

  it('debe rechazar creación sin autenticación', async () => {
    const res = await request
      .post('/api/vehicles')
      .send(buildVehicle(driverData.userId));

    expect(res.status).toBe(401);
  });
});

// ==================== OBTENER VEHÍCULOS ====================

describe('GET /api/vehicles', () => {
  let driverData;

  beforeEach(async () => {
    adminToken = await createAdminAndLogin();
    driverData = await createDriver();

    // Create a vehicle
    await request
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        licensePlate: 'XYZ-5678',
        model: 'Transit',
        brand: 'Ford',
        year: 2022,
        color: 'Amarillo',
        capacity: 25,
        driver: driverData.userId
      });
  });

  it('debe obtener lista de vehículos', async () => {
    const res = await request
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('vehicles');
    expect(Array.isArray(res.body.vehicles)).toBe(true);
    expect(res.body.vehicles.length).toBeGreaterThanOrEqual(1);
  });

  it('debe rechazar sin autenticación', async () => {
    const res = await request.get('/api/vehicles');

    expect(res.status).toBe(401);
  });
});

// ==================== OBTENER VEHÍCULO POR ID ====================

describe('GET /api/vehicles/:id', () => {
  let vehicleId;

  beforeEach(async () => {
    adminToken = await createAdminAndLogin();
    const driverData = await createDriver();

    const createRes = await request
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        licensePlate: 'GET-0001',
        model: 'Hiace',
        brand: 'Toyota',
        year: 2021,
        color: 'Gris',
        capacity: 15,
        driver: driverData.userId
      });

    vehicleId = createRes.body.vehicle._id;
  });

  it('debe obtener un vehículo por ID', async () => {
    const res = await request
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.licensePlate).toBe('GET-0001');
  });

  it('debe devolver 404 para ID inexistente', async () => {
    const res = await request
      .get('/api/vehicles/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

// ==================== ELIMINAR VEHÍCULO ====================

describe('DELETE /api/vehicles/:id', () => {
  let vehicleId;

  beforeEach(async () => {
    adminToken = await createAdminAndLogin();
    const driverData = await createDriver();

    const createRes = await request
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        licensePlate: 'DEL-0001',
        model: 'NV350',
        brand: 'Nissan',
        year: 2020,
        color: 'Azul',
        capacity: 20,
        driver: driverData.userId
      });

    vehicleId = createRes.body.vehicle._id;
  });

  it('debe eliminar un vehículo exitosamente', async () => {
    const res = await request
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('eliminado');

    // Verify it's gone
    const getRes = await request
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(404);
  });
});
