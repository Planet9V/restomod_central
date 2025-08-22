import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer, type Server } from 'http';
import express from 'express';
import { registerRoutes } from '@server/routes';
import { db } from '@db';
import { users, carShowEvents } from '@shared/schema';
import jwt from 'jsonwebtoken';

let server: Server;
let app: express.Express;
let testUser: any;
let testEvent: any;
let authToken: string;

const JWT_SECRET = process.env.JWT_SECRET || 'skinnyrod-secret-key';

beforeAll(async () => {
  app = express();
  app.use(express.json());
  server = await registerRoutes(app);
  await new Promise(resolve => server.listen(0, resolve as () => void));

  // Create a test user
  [testUser] = await db.insert(users).values({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password', // Hashing not needed for this test scope
    isAdmin: false,
    createdAt: new Date(),
  }).returning();

  // Create a test event
  [testEvent] = await db.insert(carShowEvents).values({
    eventName: 'Test Event',
    eventSlug: 'test-event',
    venue: 'Test Venue',
    city: 'Test City',
    state: 'TS',
    startDate: new Date(),
    eventType: 'car_show',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  // Generate a token for the test user
  authToken = jwt.sign({ userId: testUser.id, isAdmin: testUser.isAdmin }, JWT_SECRET);
});

import { eq } from 'drizzle-orm';

afterAll(async (done) => {
  // Clean up test data
  await db.delete(users).where(eq(users.id, testUser.id));
  await db.delete(carShowEvents).where(eq(carShowEvents.id, testEvent.id));
  server.close(done);
});

describe('Itinerary API', () => {
  it('should add an event to the itinerary', async () => {
    await request(app)
      .post('/api/itinerary')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ eventId: testEvent.id })
      .expect(201);
  });

  it('should retrieve the user itinerary', async () => {
    const response = await request(app)
      .get('/api/itinerary')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(testEvent.id);
  });

  it('should remove an event from the itinerary', async () => {
    await request(app)
      .delete(`/api/itinerary/${testEvent.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const response = await request(app)
      .get('/api/itinerary')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.length).toBe(0);
  });
});

describe('User Preferences API', () => {
    it('should get default preferences for a new user', async () => {
        const response = await request(app)
            .get('/api/user/preferences')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.preferredCategories).toEqual([]);
    });

    it('should update user preferences', async () => {
        const newPrefs = {
            homeLocation: { city: 'Testville', state: 'TS' },
            preferredCategories: ['Muscle Cars', 'JDM'],
        };

        const response = await request(app)
            .put('/api/user/preferences')
            .set('Authorization', `Bearer ${authToken}`)
            .send(newPrefs)
            .expect(200);

        expect(response.body.homeLocation.city).toBe('Testville');
        expect(response.body.preferredCategories).toEqual(['Muscle Cars', 'JDM']);
    });
});

describe('Analytics API', () => {
    it('should retrieve event analytics', async () => {
        const response = await request(app)
            .get('/api/analytics/events')
            .expect(200);

        expect(response.body).toHaveProperty('eventsByState');
        expect(response.body).toHaveProperty('eventsByCategory');
        expect(response.body).toHaveProperty('eventsByMonth');
        expect(response.body.eventsByState.length).toBeGreaterThan(0);
    });
});
