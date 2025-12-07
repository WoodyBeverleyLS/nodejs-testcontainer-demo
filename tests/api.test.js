import request from 'supertest';
import { GenericContainer, Wait } from 'testcontainers';
import { app } from '../src/app.js';
import { connectToDatabase, closeDatabase, getDatabase } from '../src/db.js';

describe('Items API with TestContainers', () => {
  let mongoContainer;
  let mongoUri;

  // Start MongoDB container before all tests
  beforeAll(async () => {
    console.log('🐳 Starting MongoDB container...');
    
    // Use GenericContainer for standalone MongoDB (no replica set)
    mongoContainer = await new GenericContainer('mongo:7')
      .withExposedPorts(27017)
      .withWaitStrategy(Wait.forLogMessage('Waiting for connections'))
      .start();

    // Get host and port, build connection string
    const host = mongoContainer.getHost();
    const port = mongoContainer.getMappedPort(27017);
    mongoUri = `mongodb://${host}:${port}/test?directConnection=true`;
    
    console.log(`✅ MongoDB container started at: ${mongoUri}`);

    // Connect to the TestContainer database
    await connectToDatabase(mongoUri);
  }, 60000);

  // Clean up after all tests
  afterAll(async () => {
    await closeDatabase();
    await mongoContainer.stop();
    console.log('🛑 MongoDB container stopped');
  });

  // Clear collection before each test
  beforeEach(async () => {
    const db = getDatabase();
    await db.collection('items').deleteMany({});
  });

  describe('POST /items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'Test Item',
        description: 'This is a test item'
      };

      const response = await request(app)
        .post('/items')
        .send(newItem)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.description).toBe(newItem.description);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/items')
        .send({ description: 'No name provided' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Name is required');
    });
  });

  describe('GET /items', () => {
    it('should return empty array when no items exist', async () => {
      const response = await request(app)
        .get('/items')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all items', async () => {
      // Insert test data
      const db = getDatabase();
      await db.collection('items').insertMany([
        { name: 'Item 1', description: 'First item', createdAt: new Date() },
        { name: 'Item 2', description: 'Second item', createdAt: new Date() }
      ]);

      const response = await request(app)
        .get('/items')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Item 1');
      expect(response.body[1].name).toBe('Item 2');
    });
  });

  describe('GET /items/:id', () => {
    it('should return a single item by ID', async () => {
      // Insert test data
      const db = getDatabase();
      const result = await db.collection('items').insertOne({
        name: 'Single Item',
        description: 'Test description',
        createdAt: new Date()
      });

      const response = await request(app)
        .get(`/items/${result.insertedId}`)
        .expect(200);

      expect(response.body.name).toBe('Single Item');
      expect(response.body.description).toBe('Test description');
    });

    it('should return 404 if item not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

      const response = await request(app)
        .get(`/items/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Item not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/items/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('Invalid ID format');
    });
  });

  describe('PUT /items/:id', () => {
    it('should update an existing item', async () => {
      // Insert test data
      const db = getDatabase();
      const result = await db.collection('items').insertOne({
        name: 'Original Name',
        description: 'Original description',
        createdAt: new Date()
      });

      const updates = {
        name: 'Updated Name',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/items/${result.insertedId}`)
        .send(updates)
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.description).toBe('Updated description');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 if item not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/items/${fakeId}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.error).toBe('Item not found');
    });
  });

  describe('DELETE /items/:id', () => {
    it('should delete an item', async () => {
      // Insert test data
      const db = getDatabase();
      const result = await db.collection('items').insertOne({
        name: 'To Delete',
        description: 'Will be deleted',
        createdAt: new Date()
      });

      await request(app)
        .delete(`/items/${result.insertedId}`)
        .expect(200);

      // Verify item is deleted
      const deletedItem = await db.collection('items').findOne({ _id: result.insertedId });
      expect(deletedItem).toBeNull();
    });

    it('should return 404 if item not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/items/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Item not found');
    });
  });
});
