import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5005,
  mongoUri: process.env.MONGO_URL,
  dbName: process.env.dbName,
  jwtSecret: process.env.JWT_SECRET,
  cloudinary: {
    cloudName: process.env.Cloud_Name,
    apiKey: process.env.Cloud_Api,
    apiSecret: process.env.Cloud_Secret,
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

export default config;
