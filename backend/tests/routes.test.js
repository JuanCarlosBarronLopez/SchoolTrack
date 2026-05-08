import { jest } from '@jest/globals';
import supertest from 'supertest';
import { connect, closeDatabase, clearDatabase } from './helpers/dbHandler.js';
import { createApp } from './helpers/appFactory.js';
import Route from '../src/models/Route.js';
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

async function createAdmin() {
  const res = await request.post('/api/auth/register').send({
    firstName: 'Admin', lastName: 'Routes',
    email: 'admin.routes@test.com',
    password: 'admin123456',
    role: 'admin'
  });
  return res.body.token;
}

async function createParent() {
  const res = await request.post('/api/auth/register').send({
    firstName: 'Parent', lastName: 'TestUser',
    email: 'parent.routes@test.com',
    password: 'parent123456',
    role: 'parent'
  });
  return res.body.token;
}

const buildRoute = (overrides = {}) => ({
  name: 'Ruta Centro',
  code: 'RC-001',
  school: {
    name: 'Escuela Primaria Test',
    address: 'Av. Principal #123, Centro',
    coordinates: {
      type: 'Point',
      coordinates: [-99.1332, 19.4326]
    }
  },
  status: 'active',
  ...overrides
});

// ==================== MODELO ROUTE ====================

describe('Route Model', () => {
  it('debe crear una ruta con datos válidos', async () => {
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'ModelTest',
      email: 'admin.model@test.com',
      password: 'pass123456',
      role: 'admin'
    });

    const route = await Route.create({
      name: 'Ruta Norte',
      code: 'RN-001',
      school: {
        name: 'Escuela Norte',
        address: 'Calle Norte #1',
        coordinates: { type: 'Point', coordinates: [-99.1, 19.5] }
      },
      createdBy: admin._id
    });

    expect(route).toBeDefined();
    expect(route.name).toBe('Ruta Norte');
    expect(route.code).toBe('RN-001');
    expect(route.status).toBe('active');
  });

  it('debe rechazar ruta sin nombre', async () => {
    await expect(Route.create({
      code: 'XX-001',
      school: {
        name: 'Test School',
        address: 'Address',
        coordinates: { type: 'Point', coordinates: [0, 0] }
      }
    })).rejects.toThrow();
  });

  it('debe rechazar código duplicado', async () => {
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'DupTest',
      email: 'admin.dup@test.com',
      password: 'pass123456',
      role: 'admin'
    });

    await Route.create({
      name: 'Ruta Alpha', code: 'DUP-001',
      school: {
        name: 'School', address: 'Addr',
        coordinates: { type: 'Point', coordinates: [0, 0] }
      },
      createdBy: admin._id
    });

    await expect(Route.create({
      name: 'Ruta Beta', code: 'DUP-001',
      school: {
        name: 'School', address: 'Addr',
        coordinates: { type: 'Point', coordinates: [0, 0] }
      },
      createdBy: admin._id
    })).rejects.toThrow();
  });
});

// ==================== API ROUTES ====================

describe('GET /api/routes', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await createAdmin();
  });

  it('debe obtener lista de rutas (admin)', async () => {
    const res = await request
      .get('/api/routes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('routes');
    expect(Array.isArray(res.body.routes)).toBe(true);
  });

  it('debe rechazar sin autenticación', async () => {
    const res = await request.get('/api/routes');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/routes/active', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await createAdmin();
  });

  it('debe obtener solo rutas activas', async () => {
    const res = await request
      .get('/api/routes/active')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/routes', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await createAdmin();
  });

  it('debe crear una ruta exitosamente (admin)', async () => {
    const routeData = buildRoute();

    const res = await request
      .post('/api/routes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(routeData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('route');
    expect(res.body.route.name).toBe('Ruta Centro');
    expect(res.body.route.code).toBe('RC-001');
  });

  it('debe rechazar ruta sin nombre', async () => {
    const routeData = buildRoute({ name: '' });

    const res = await request
      .post('/api/routes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(routeData);

    expect(res.status).toBe(400);
  });

  it('debe rechazar ruta sin código', async () => {
    const routeData = buildRoute({ code: '' });

    const res = await request
      .post('/api/routes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(routeData);

    expect(res.status).toBe(400);
  });

  it('debe rechazar creación por parent (sin permisos)', async () => {
    const parentToken = await createParent();
    const routeData = buildRoute({ code: 'PARENT-001' });

    const res = await request
      .post('/api/routes')
      .set('Authorization', `Bearer ${parentToken}`)
      .send(routeData);

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/routes/:id', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await createAdmin();
  });

  it('debe eliminar una ruta exitosamente', async () => {
    const createRes = await request
      .post('/api/routes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(buildRoute({ code: 'DEL-001' }));

    expect(createRes.status).toBe(201);
    const routeId = createRes.body.route._id;

    const res = await request
      .delete(`/api/routes/${routeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('eliminada');
  });

  it('debe devolver 404 para ruta inexistente', async () => {
    const res = await request
      .delete('/api/routes/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
