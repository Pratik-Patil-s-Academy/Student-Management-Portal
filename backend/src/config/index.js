import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envVarsSchema = Joi.object({
  PORT: Joi.number().default(5005),
  MONGO_URL: Joi.string().required().description('MongoDB Base URL'),
  dbName: Joi.string().required().description('MongoDB Database Name'),
  JWT_SEC: Joi.string().required().description('JWT Secret Key'),
  Cloud_Name: Joi.string().required().description('Cloudinary Cloud Name'),
  Cloud_Api: Joi.string().required().description('Cloudinary API Key'),
  Cloud_Secret: Joi.string().required().description('Cloudinary API Secret'),
  MY_GMAIL: Joi.string().allow('').description('Email address for Nodemailer'),
  MY_PASS: Joi.string().allow('').description('Email password for Nodemailer'),
  CLIENT_URL: Joi.string().default('http://localhost:3000'),
  NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development')
}).unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoUri: envVars.MONGO_URL,
  dbName: envVars.dbName,
  jwtSecret: envVars.JWT_SEC,
  cloudinary: {
    cloudName: envVars.Cloud_Name,
    apiKey: envVars.Cloud_Api,
    apiSecret: envVars.Cloud_Secret,
  },
  clientUrl: envVars.CLIENT_URL,
};

export default config;
