/**
 * Express app factory for testing.
 * Creates the app with routes and middleware but WITHOUT
 * starting the HTTP server or connecting to the real DB.
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../../src/routes/auth.js';
import vehicleRoutes from '../../src/routes/vehicles.js';
import routeRoutes from '../../src/routes/routes.js';
import stopRoutes from '../../src/routes/stops.js';
import { errorHandler, notFound } from '../../src/middleware/errorHandler.js';

// Set test env vars before anything else
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
process.env.JWT_EXPIRE = '15m';
process.env.NODE_ENV = 'test';

export function createApp() {
  const app = express();

  // Minimal middleware for tests
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(process.env.JWT_SECRET));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Test server running' });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/routes', routeRoutes);
  app.use('/api/stops', stopRoutes);

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
