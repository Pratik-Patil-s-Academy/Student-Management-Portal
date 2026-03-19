import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  
  logger.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
    statusCode
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
