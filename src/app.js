import express from 'express';
import { connectToDatabase, closeDatabase } from './db.js';
import itemsRouter from './routes/items.js';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/demo?authSource=admin';

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'TestContainers MongoDB Demo API',
    endpoints: {
      'GET /items': 'Get all items',
      'GET /items/:id': 'Get item by ID',
      'POST /items': 'Create new item',
      'PUT /items/:id': 'Update item',
      'DELETE /items/:id': 'Delete item'
    }
  });
});

app.use('/items', itemsRouter);

// Start server
async function startServer() {
  try {
    await connectToDatabase(MONGODB_URI);
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      await closeDatabase();
      server.close(() => {
        console.log('Process terminated');
      });
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, startServer };
