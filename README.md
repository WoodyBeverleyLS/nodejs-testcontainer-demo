# Node.js TestContainers MongoDB Demo

A simple REST API demonstration using TestContainers for MongoDB integration testing.

## 🎯 Purpose

This project demonstrates how to use TestContainers to test a Node.js REST API with MongoDB without requiring a persistent database setup. Each test run gets a fresh, isolated MongoDB instance in a Docker container.

## 🚀 Features

- ✅ Simple Express.js REST API
- ✅ MongoDB for data storage
- ✅ TestContainers for isolated testing
- ✅ Docker Compose for local development
- ✅ Full CRUD operations
- ✅ Pure JavaScript (no TypeScript)

## 📋 Prerequisites

- Node.js 18+ installed
- Docker Desktop running
- npm or yarn

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

## 🏃 Running Locally

### Option 1: Docker Compose (Recommended for development)

```bash
# Start MongoDB container
npm run docker:up

# Start the API server
npm start

# Or use nodemon for auto-reload
npm run dev

# Stop MongoDB container when done
npm run docker:down
```

The API will be available at `http://localhost:3000`

### Option 2: Use existing MongoDB instance

Update the `MONGODB_URI` in your `.env` file to point to your MongoDB instance.

## 🧪 Testing with TestContainers

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

**What happens during testing:**
1. 🐳 TestContainers starts a MongoDB container automatically
2. ✅ Tests run against the fresh database
3. 🧹 Container is automatically stopped and cleaned up
4. 🔄 Each test run gets a fresh database

**No manual setup required!** Just ensure Docker is running.

## 📚 API Endpoints

### Base URL
```
http://localhost:3000
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/items` | Get all items |
| GET | `/items/:id` | Get item by ID |
| POST | `/items` | Create new item |
| PUT | `/items/:id` | Update item |
| DELETE | `/items/:id` | Delete item |

### Example Requests

**Create an item:**
```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "My Item", "description": "Test item"}'
```

**Get all items:**
```bash
curl http://localhost:3000/items
```

**Get item by ID:**
```bash
curl http://localhost:3000/items/6584a1b2c3d4e5f6a7b8c9d0
```

**Update item:**
```bash
curl -X PUT http://localhost:3000/items/6584a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item", "description": "Updated description"}'
```

**Delete item:**
```bash
curl -X DELETE http://localhost:3000/items/6584a1b2c3d4e5f6a7b8c9d0
```

## 📁 Project Structure

```
nodejs-testcontainer-demo/
├── src/
│   ├── app.js              # Express app setup
│   ├── db.js               # MongoDB connection
│   └── routes/
│       └── items.js        # CRUD endpoints
├── tests/
│   └── api.test.js         # TestContainer tests
├── docker-compose.yml      # Local MongoDB setup
├── jest.config.js          # Jest configuration
├── package.json
└── README.md
```

## 🔑 Key Concepts Demonstrated

### 1. TestContainers Setup
```javascript
beforeAll(async () => {
  mongoContainer = await new MongoDBContainer('mongo:7')
    .withExposedPorts(27017)
    .start();
  
  mongoUri = mongoContainer.getConnectionString();
  await connectToDatabase(mongoUri);
});
```

### 2. Automatic Cleanup
```javascript
afterAll(async () => {
  await closeDatabase();
  await mongoContainer.stop();
});
```

### 3. Fresh State Per Test
```javascript
beforeEach(async () => {
  const db = getDatabase();
  await db.collection('items').deleteMany({});
});
```

## 🎓 Why TestContainers?

**Traditional Approach Problems:**
- ❌ Requires manual MongoDB setup
- ❌ Shared database state between tests
- ❌ Different environments (dev vs CI)
- ❌ Data pollution between test runs

**TestContainers Benefits:**
- ✅ Automated container lifecycle
- ✅ Isolated test environment
- ✅ Consistent across all environments
- ✅ Fresh database for each test run
- ✅ No manual cleanup needed

## 🐛 Troubleshooting

**Tests fail with "Docker not running":**
- Ensure Docker Desktop is started
- Verify Docker is accessible: `docker info`

**Port 27017 already in use:**
- Stop any running MongoDB: `npm run docker:down`
- Or change the port in `docker-compose.yml`

**Jest timeout errors:**
- First test run may take longer (pulling MongoDB image)
- Subsequent runs will be faster

## 📝 License

MIT

## 🤝 Contributing

This is a demo project for learning purposes. Feel free to fork and experiment!
