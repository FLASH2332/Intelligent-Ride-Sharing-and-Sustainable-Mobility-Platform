// Simple demonstration tests for HTTP API using Supertest
import request from 'supertest';
import express from 'express';

// Create a simple test app
const testApp = express();
testApp.use(express.json());

testApp.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

testApp.post('/demo-endpoint', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  res.status(200).json({ message: `Hello, ${name}!` });
});

describe('API Integration Tests - Demo with Supertest', () => {
  describe('GET /health', () => {
    test('should return 200 status for health check', async () => {
      const response = await request(testApp).get('/health');
      
      expect(response.status).toBe(200);
    });

    test('should return JSON response', async () => {
      const response = await request(testApp).get('/health');
      
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });

    test('should return success message', async () => {
      const response = await request(testApp).get('/health');
      
      expect(response.body.message).toBe('Server is running');
    });
  });

  describe('POST /demo-endpoint', () => {
    test('should accept POST requests', async () => {
      const response = await request(testApp)
        .post('/demo-endpoint')
        .send({ name: 'John' });
      
      expect(response.status).toBe(200);
    });

    test('should return error for missing fields', async () => {
      const response = await request(testApp)
        .post('/demo-endpoint')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should process valid request', async () => {
      const response = await request(testApp)
        .post('/demo-endpoint')
        .send({ name: 'Alice' });
      
      expect(response.body.message).toContain('Alice');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(testApp).get('/non-existent');
      
      expect(response.status).toBe(404);
    });
  });
});
