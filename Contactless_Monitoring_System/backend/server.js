import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import institutionRoutes from './routes/institutionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Contactless Entry API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
