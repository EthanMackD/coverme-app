console.log('=== Starting server.js ===');

const express = require('express');
console.log('Express loaded');

const cors = require('cors');
console.log('CORS loaded');

const pool = require('./config/db');
console.log('Database pool loaded');

require('dotenv').config();
console.log('Environment variables loaded');

const app = express();
console.log('Express app created');

const PORT = process.env.PORT || 5000;
console.log('PORT:', PORT);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('CORS middleware added');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('Body parser middleware added');

console.log('Loading auth routes...');
const authRoutes = require('./routes/auth');
console.log('Auth routes loaded');

app.use('/api/auth', authRoutes);
console.log('Auth routes registered');

app.get('/api/test', (req, res) => {
  console.log('Test route hit!');
  res.json({ message: 'Backend is working!' });
});

app.get('/api/db-test', async (req, res) => {
  console.log('DB test route hit!');
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Database connected!', 
      time: result.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Error middleware triggered:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

console.log('About to start listening on port', PORT);

const server = app.listen(PORT, () => {
  console.log(`=== Server is now listening on port ${PORT} ===`);
  console.log('Server object:', typeof server);
  console.log('Listening:', server.listening);
});

console.log('app.listen() called');

// Add error handler for server
server.on('error', (error) => {
  console.error('SERVER ERROR:', error);
});

// Prevent process from exiting
process.stdin.resume();

console.log('=== End of server.js file ===');
