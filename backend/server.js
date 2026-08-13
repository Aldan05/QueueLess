const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const seedDB = require('./seed_helper');

// Load env vars
dotenv.config({ path: require('path').join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Pass io to routes by adding it to the request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/businesses', require('./routes/business'));
app.use('/api/customer', require('./routes/customer'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/complaints', require('./routes/complaint'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/counters', require('./routes/counter'));
app.use('/api/notifications', require('./routes/notification').router);
// Debug / testing routes (temporary)
app.use('/api/debug', require('./routes/debug'));

// Global Error Handler to ensure JSON responses
app.use((err, req, res, next) => {
  console.error('Express Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Socket.IO Handlers
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join customer room for personalized live updates
  socket.on('joinCustomerRoom', (customerId) => {
    socket.join(`customer_${customerId}`);
    console.log(`Socket ${socket.id} joined customer room: customer_${customerId}`);
  });

  socket.on('leaveCustomerRoom', (customerId) => {
    socket.leave(`customer_${customerId}`);
    console.log(`Socket ${socket.id} left customer room: customer_${customerId}`);
  });

  // Join a specific business room to listen for updates
  socket.on('joinBusinessRoom', (businessId) => {
    socket.join(`business_${businessId}`);
    console.log(`Socket ${socket.id} joined room: business_${businessId}`);
  });

  socket.on('leaveBusinessRoom', (businessId) => {
    socket.leave(`business_${businessId}`);
    console.log(`Socket ${socket.id} left room: business_${businessId}`);
  });

  socket.on('joinAdminRoom', () => {
    socket.join('admin');
    console.log(`Socket ${socket.id} joined room: admin`);
  });

  socket.on('leaveAdminRoom', () => {
    socket.leave('admin');
    console.log(`Socket ${socket.id} left room: admin`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Database connection helper
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.log('No MONGODB_URI found in environment. Starting In-Memory MongoDB Server...');
    await startMemoryServer();
    return;
  }

  try {
    // Attempt standard connection
    await mongoose.connect(uri);
    console.log('MongoDB Connected successfully to:', uri.split('@').pop()); // Hide credentials in log
    
    // Seed if it is a local DB connection
    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
      console.log('Local DB detected. Seeding database...');
      await seedDB();
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    
    // Fallback to memory server if local connection failed
    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
      console.log('Failed to connect to local MongoDB. Starting In-Memory MongoDB Server fallback...');
      await startMemoryServer();
    } else {
      console.error('Database connection failed and no fallback is applicable. Exiting...');
      process.exit(1);
    }
  }
};

const startMemoryServer = async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    console.log('In-Memory MongoDB Connected at:', uri);
    
    // Seed database automatically for in-memory server
    console.log('Seeding in-memory database...');
    await seedDB();
    console.log('In-memory database seeded.');
  } catch (error) {
    console.error('Failed to start in-memory MongoDB server:', error);
    process.exit(1);
  }
};

// Connect to DB and then start Express server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server and Socket.IO running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to DB during startup:', err);
});
// trigger restart
