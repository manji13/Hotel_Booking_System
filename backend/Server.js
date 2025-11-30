import 'dotenv/config'; // <--- THIS MUST BE THE FIRST LINE
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import connectDB from './db.js';

import userRoutes from './Routes/userRoutes.js';
import roomRoutes from './Routes/roomRoutes.js';
import paymentRoutes from './Routes/paymentRoute.js';

// dotenv.config(); <--- Remove this line, it's done at the top now

// DEBUG: Check Stripe key from server.js
console.log("DEBUG STRIPE KEY (server.js):", process.env.STRIPE_SECRET_KEY ? "Loaded" : "Missing");

connectDB();

const app = express();

// Middleware for webhooks (must come before express.json())
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Regular middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploads statically
app.use('/uploads', express.static(uploadsDir));

// Test routes
app.get('/', (req, res) => res.send('API is running...'));
app.get('/api/test', (req, res) => res.json({ message: "Backend and Frontend are Connected Successfully!" }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});