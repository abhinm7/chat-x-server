import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/room.js';
import { initializeSocket } from './socket/socket.js';

dotenv.config();
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Database connection
import connectDB from './config/db.js';
connectDB();

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});
initializeSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => 
  console.log(`Server running on port ${PORT}`));
