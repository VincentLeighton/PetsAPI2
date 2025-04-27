import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from './index';

// Mock data for testing
const mockPet = {
  name: 'Test Pet',
  owner: 'Test Owner',
  imageUrl: 'https://example.com/test-pet.jpg',
  favoriteFood: 'Test Food',
};

describe('Pets API', () => {
  it('should fetch all pets', async () => {
    const response = await request(app).get('/pets');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should add a new pet', async () => {
    const response = await request(app).post('/pet').send(mockPet);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: mockPet.name,
      owner: mockPet.owner,
      imageUrl: mockPet.imageUrl,
      favoriteFood: mockPet.favoriteFood,
      isFed: false,
    });
  });

  it('should not add a pet with missing fields', async () => {
    const response = await request(app).post('/pet').send({ name: '', owner: '' });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should update isFed status of a pet', async () => {
    const addResponse = await request(app).post('/pet').send(mockPet);
    const petId = addResponse.body.id;

    const response = await request(app).patch(`/pet/${petId}`);
    expect(response.status).toBe(200);
    expect(response.body.pet.isFed).toBe(true);
  });

  it('should delete a pet', async () => {
    const addResponse = await request(app).post('/pet').send(mockPet);
    const petId = addResponse.body.id;

    const response = await request(app).delete(`/pet/${petId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Pet has been removed.');
  });

  it('should return 404 for non-existent pet', async () => {
    const response = await request(app).patch('/pet/non-existent-id');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Pet not found.');
  });

  it('should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
  });

  it('should return 200 for favicon.ico if found', async () => {
    const response = await request(app).get('/favicon.ico');
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toBe('image/x-icon');
  });

  it('should return 200 for the root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, World!');
  });
});