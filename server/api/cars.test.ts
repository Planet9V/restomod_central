import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer, type Server } from 'http';
import express from 'express';
import { registerRoutes } from '../routes';

let server: Server;
let app: express.Express;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  server = await registerRoutes(app);
  await new Promise(resolve => server.listen(0, resolve as () => void));
});

afterAll((done) => {
  server.close(done);
});

describe('GET /api/cars', () => {
  it('should return a list of cars when searching for "mustang"', async () => {
    const response = await request(app)
      .get('/api/cars?search=mustang')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    const hasMustang = response.body.some((car: any) =>
      car.model.toLowerCase().includes('mustang')
    );
    expect(hasMustang).toBe(true);
  });

  it('should return an empty array for a nonsense search', async () => {
    const response = await request(app)
      .get('/api/cars?search=asdfghjkl')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});
