import logger from './utils/logger.js';
import connectDb from './config/db.js';
import { createAdmin } from './scripts/createAdmin.js';
import app from './app.js';
import config from './config/index.js';
import './config/cloudinary.js';

connectDb().then(() => {
  createAdmin();
  app.listen(config.port, () => {
    logger.info(`Server started successfully on port ${config.port}`);
    console.log(`Server is running on http://localhost:${config.port}`);
  });
}).catch((error) => {
  logger.error(`Database connection failed: ${error.message}`, { stack: error.stack });
  process.exit(1);
});
