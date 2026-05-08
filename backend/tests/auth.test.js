import { jest } from '@jest/globals';
import supertest from 'supertest';
import { connect, closeDatabase, clearDatabase } from './helpers/dbHandler.js';
import { createApp } from './helpers/appFactory.js';

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

// ==================== REGISTRO ====================

describe('POST /api/auth/register', () => {
  const validUser = {
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos@test.com',
    password: 'password123',
    role: 'parent'
  };

  it('debe registrar un nuevo usuario exitosamente', async () => {
    const res = await request
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.firstName).toBe(validUser.firstName);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('debe establecer cookie de refreshToken', async () => {
    const res = await request
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const refreshCookie = cookies.find(c => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
  });

  it('debe rechazar registro sin email', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ ...validUser, email: undefined });

    expect(res.status).toBe(400);
  });

  it('debe rechazar registro sin contraseña', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ ...validUser, password: undefined });

    expect(res.status).toBe(400);
  });

  it('debe rechazar contraseña menor a 6 caracteres', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ ...validUser, password: '123' });

    expect(res.status).toBe(400);
  });

  it('debe rechazar email duplicado', async () => {
    await request.post('/api/auth/register').send(validUser);

    const res = await request
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('ya registrado');
  });

  it('debe aceptar registro con "name" en vez de firstName/lastName', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({
        name: 'Juan Pérez',
        email: 'juan@test.com',
        password: 'password123'
      });

    expect(res.status).toBe(201);
    expect(res.body.user.firstName).toBe('Juan');
    expect(res.body.user.lastName).toBe('Pérez');
  });
});

// ==================== LOGIN ====================

describe('POST /api/auth/login', () => {
  const testUser = {
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@test.com',
    password: 'password123',
    role: 'admin'
  };

  beforeEach(async () => {
    await request.post('/api/auth/register').send(testUser);
  });

  it('debe hacer login exitosamente con credenciales correctas', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('debe establecer cookie de refreshToken en login', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.startsWith('refreshToken='))).toBe(true);
  });

  it('debe rechazar login con email inexistente', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: 'password123' });

    expect(res.status).toBe(404);
  });

  it('debe rechazar login con contraseña incorrecta', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('incorrecta');
  });

  it('debe rechazar login sin campos requeridos', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });
});

// ==================== PERFIL ====================

describe('GET /api/auth/profile', () => {
  it('debe obtener el perfil del usuario autenticado', async () => {
    const registerRes = await request
      .post('/api/auth/register')
      .send({
        firstName: 'María',
        lastName: 'Torres',
        email: 'maria@test.com',
        password: 'password123'
      });

    const token = registerRes.body.token;

    const res = await request
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('maria@test.com');
    expect(res.body.firstName).toBe('María');
    expect(res.body).not.toHaveProperty('password');
  });

  it('debe rechazar acceso sin token', async () => {
    const res = await request.get('/api/auth/profile');

    expect(res.status).toBe(401);
  });

  it('debe rechazar acceso con token inválido', async () => {
    const res = await request
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid-token-here');

    expect(res.status).toBe(401);
  });
});

// ==================== REFRESH TOKEN ====================

describe('POST /api/auth/refresh', () => {
  it('debe refrescar el access token con un refresh token válido', async () => {
    const registerRes = await request
      .post('/api/auth/register')
      .send({
        firstName: 'Pedro',
        lastName: 'Martínez',
        email: 'pedro@test.com',
        password: 'password123'
      });

    expect(registerRes.status).toBe(201);

    // Extract refreshToken cookie
    const cookies = registerRes.headers['set-cookie'];
    const refreshCookie = cookies.find(c => c.startsWith('refreshToken='));

    const res = await request
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('debe rechazar refresh sin cookie', async () => {
    const res = await request.post('/api/auth/refresh');

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('no proporcionado');
  });
});

// ==================== LOGOUT ====================

describe('POST /api/auth/logout', () => {
  it('debe cerrar sesión exitosamente', async () => {
    const registerRes = await request
      .post('/api/auth/register')
      .send({
        firstName: 'Laura',
        lastName: 'Díaz',
        email: 'laura@test.com',
        password: 'password123'
      });

    const token = registerRes.body.token;
    const cookies = registerRes.headers['set-cookie'];
    const refreshCookie = cookies.find(c => c.startsWith('refreshToken='));

    const res = await request
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', refreshCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('cerrada');
  });

  it('debe rechazar logout sin autenticación', async () => {
    const res = await request.post('/api/auth/logout');

    expect(res.status).toBe(401);
  });
});

// ==================== HEALTH CHECK ====================

describe('GET /api/health', () => {
  it('debe responder con éxito', async () => {
    const res = await request.get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
