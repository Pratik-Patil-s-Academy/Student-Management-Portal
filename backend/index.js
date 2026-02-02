import  express from 'express';
import dotenv from 'dotenv';
import connectDb from './db/db.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import cors from 'cors';


dotenv.config();
const port=process.env.PORT || 5005;

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174','http://localhost:5500', 'https://ppacademy.vercel.app'],
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

const app=express();
app.use(cors(corsOptions));
app.use(bodyParser.json()); 
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is healthy' });
}); 



connectDb().then(() => {
  app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || port}`);
  });
});
