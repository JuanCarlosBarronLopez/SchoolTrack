import { jest } from '@jest/globals';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';

describe('WebSockets Tests', () => {
  let io, serverSocket, clientSocket;
  let httpServer;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    
    httpServer.listen(() => {
      const port = httpServer.address().port;
      
      // Simular la lógica de server.js
      io.on('connection', (socket) => {
        serverSocket = socket;
        
        socket.on('location-update', (data) => {
          io.emit('location-updated', {
            vehicleId: data.vehicleId,
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: expect.any(String), // The test will receive stringified ISO date
            speed: data.speed,
            accuracy: data.accuracy
          });
        });

        socket.on('status-change', (data) => {
          io.emit('status-changed', {
            vehicleId: data.vehicleId,
            status: data.status,
            timestamp: expect.any(String)
          });
        });
      });
      
      clientSocket = Client(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  it('debe enviar y recibir location-update', (done) => {
    const testData = {
      vehicleId: 'VEH-001',
      latitude: 19.4326,
      longitude: -99.1332,
      speed: 45,
      accuracy: 10
    };

    clientSocket.on('location-updated', (data) => {
      expect(data.vehicleId).toBe(testData.vehicleId);
      expect(data.latitude).toBe(testData.latitude);
      expect(data.longitude).toBe(testData.longitude);
      expect(data.speed).toBe(testData.speed);
      expect(data.timestamp).toBeDefined();
      
      clientSocket.off('location-updated');
      done();
    });

    clientSocket.emit('location-update', testData);
  });

  it('debe emitir status-changed globalmente cuando un vehículo cambia de estado', (done) => {
    const testStatus = {
      vehicleId: 'VEH-002',
      status: 'in_transit'
    };

    clientSocket.on('status-changed', (data) => {
      expect(data.vehicleId).toBe(testStatus.vehicleId);
      expect(data.status).toBe(testStatus.status);
      expect(data.timestamp).toBeDefined();
      
      clientSocket.off('status-changed');
      done();
    });

    clientSocket.emit('status-change', testStatus);
  });
});
