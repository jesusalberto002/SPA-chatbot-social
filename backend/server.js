const express = require('express');
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();
const { Pool } = require('pg');
const indexRoutes = require('./src/routes/index');
const stripeRoutes = require('./src/routes/stripe');

// Local Postgres usually has no SSL; RDS/cloud needs it — set DB_SSL=true in production.
const dbSsl =
  process.env.DB_SSL === 'true' || process.env.DB_SSL === '1'
    ? { rejectUnauthorized: false }
    : false;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: dbSsl,
});

// In your server.js or index.js
const path = require('path');
require('dotenv').config();

// --- ADD THESE DEBUGGING LINES ---
console.log("--- GOOGLE AUTH DEBUG ---");
console.log("1. Raw .env variable:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
try {
    const absolutePath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log("2. Resolved absolute path:", absolutePath);
} catch(e) {
    console.log("2. Could not resolve path. The variable is likely undefined.");
}
console.log("-------------------------\n");
// --- END DEBUGGING LINES ---

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Successfully connected to the database. Current time from DB:', res.rows[0].now);
  }
});

// Initialize Express application
const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://d2lncv8bc1ga81.cloudfront.net',
    'https://spa-chatbot-social.vercel.app',
    'https://jesusojeda.dev',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim().replace(/\/$/, '')) : []),
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
};

app.use('/api/stripe', stripeRoutes);

app.use(express.json());

// Use the new options in your cors middleware
app.use(cors(corsOptions));

// Initial server route
app.get('/', (req, res) => {
  res.send('Welcome to the API development server');
});

app.use('/api', indexRoutes);
app.use(express.static('public'));

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});