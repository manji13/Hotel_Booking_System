import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db.js'; 

// 1. CHANGE THIS LINE (Rename 'router' to 'userRoutes' for clarity)
import userRoutes from './Routes/userRoutes.js'; 

// Load config
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json()); 

// CORS Configuration
app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/test', (req, res) => {
  res.json({ message: "Backend and Frontend are Connected Successfully!" });
});

// 2. ADD THIS LINE (This actually enables the login/register links)
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});