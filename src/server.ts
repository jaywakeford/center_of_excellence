import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import configurations and middleware
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authenticateToken } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import innovationRoutes from './routes/innovation.routes';
import rapidRoutes from './routes/rapid.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';

// Import services
import { socketService } from './services/socket.service';
import { prisma } from './config/database';

// Create Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: config.cors.origin,
    credentials: true
  }
});

// Global middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.env !== 'test') {
  app.use(morgan(config.logging.format));
}

// Rate limiting
app.use('/api/', rateLimiter);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/innovations', authenticateToken, innovationRoutes);
app.use('/api/rapid', authenticateToken, rapidRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

// Initialize Socket.io service
socketService.initialize(io);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing server gracefully...');
  
  httpServer.close(async () => {
    console.log('HTTP server closed');
    
    // Close database connection
    await prisma.$disconnect();
    console.log('Database connection closed');
    
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${config.env} mode`);
  console.log(`📡 Socket.io server initialized`);
  console.log(`🔒 CORS enabled for: ${config.cors.origin}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in production
  if (config.env === 'development') {
    process.exit(1);
  }
});

export { app, httpServer, io }; 