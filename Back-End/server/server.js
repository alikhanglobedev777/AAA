const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const businessRoutes = require('./routes/business');
const reviewRoutes = require('./routes/review');
const adminRoutes = require('./routes/admin');
const serviceCategoryRoutes = require('./routes/serviceCategories');
const inquiryRoutes = require('./routes/inquiry');
const complaintRoutes = require('./routes/complaints');
const messagingRoutes = require('./routes/messaging');
const helpCenterRoutes = require('./routes/helpCenter');
const connectDB = require('./config/db');
// const redisCache = require('./config/redis'); // Temporarily disabled

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'SESSION_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('💡 Please create a .env file with the required variables');
  console.error('💡 See .env.example for reference');
  process.exit(1);
}

require('./config/passport');

const app = express();
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Initialize default super admin after database connection
const Admin = require('./models/Admin');
setTimeout(async () => {
  try {
    await Admin.initializeDefaultSuperAdmin();
    console.log('✅ Default super admin initialization completed');
  } catch (error) {
    console.error('❌ Error initializing default super admin:', error);
  }
}, 2000); // Wait 2 seconds for database connection to be fully established

// Initialize Redis cache
// redisCache.connect(); // Temporarily disabled

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and status endpoints
    return req.path === '/' || req.path === '/api/status';
  }
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Body parser middleware with increased limits for file uploads
app.use(express.json({ 
  limit: '50mb'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb',
  parameterLimit: 20000
}));

// Session configuration with enhanced security
app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 1 day
    autoRemove: 'native'
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: 'lax',
    path: '/'
  },
  name: 'aaa-services-session'
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/help-center', helpCenterRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 AAA Services API Server is running...',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    message: 'API is operational',
    status: 'success',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /',
      'GET /api/status',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/users/register',
      'POST /api/users/login',
      'GET /api/users/profile',
      'PUT /api/users/profile',
      'PUT /api/users/profile-picture',
      'PUT /api/users/change-password',
      'GET /api/users/:id',
      'POST /api/business',
      'GET /api/business',
      'GET /api/business/:id',
      'PUT /api/business/:id',
      'DELETE /api/business/:id',
      'GET /api/business/owner/my-business',
      'POST /api/reviews',
      'GET /api/reviews'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      error: 'The provided ID is not valid'
    });
  }
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
      error: 'Please provide a valid authentication token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
      error: 'Please login again to get a new token'
    });
  }
  
  // Default error response
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const server = require('http').createServer(app);

// Initialize Socket.IO
const { initializeSocket } = require('./socket');
const io = initializeSocket(server);

// Store io instance globally for use in other modules
global.io = io;

server.listen(PORT, () => console.log(`Server on ${PORT}`));


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
