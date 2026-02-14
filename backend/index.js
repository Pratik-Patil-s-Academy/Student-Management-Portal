import express from 'express';
import dotenv from 'dotenv';
import connectDb from './db/db.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import cors from 'cors';
import { createAdmin } from './scripts/createAdmin.js';
import adminRoutes from './routes/adminRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import testRoutes from './routes/testRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import logger from './utils/logger.js';
import requestLogger from './middlewares/requestLogger.js';
import { generalLimiter, authLimiter } from './middlewares/rateLimiter.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger/swagger.js';

dotenv.config();
const port = process.env.PORT || 5005;

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5176', 'http://localhost:5500', 'https://ppacademy.vercel.app', 'https://temp-smp.vercel.app', 'https://pratikpatilsacademy.vercel.app'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

cloudinary.v2.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.Cloud_Api,
  api_secret: process.env.Cloud_Secret,
});

const app = express();

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

// app.use(generalLimiter);

app.use('/api/health', healthRoutes);

// Routes with specific rate limiters
app.use('/api/admin', adminRoutes); // need to add authLimiter here if login route is not separated in adminRoutes.js
app.use('/api/admissions', admissionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/fees', feeRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err, req, res, next) => {
  logger.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
    statusCode: err.status || 500
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

connectDb().then(() => {
  createAdmin();
  app.listen(process.env.PORT || port, () => {
    logger.info(`Server started successfully on port ${process.env.PORT || port}`);
    console.log(`Server is running on http://localhost:${process.env.PORT || port}`);
  });
}).catch((error) => {
  logger.error(`Database connection failed: ${error.message}`, { stack: error.stack });
  process.exit(1);
});
