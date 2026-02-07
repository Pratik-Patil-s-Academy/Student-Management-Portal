import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info(`[REQUEST] ${req.method} ${req.url} - IP: ${req.ip || req.connection.remoteAddress}`);

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `[RESPONSE] ${req.method} ${req.url} - Status: ${res.statusCode} - Duration: ${duration}ms - IP: ${req.ip || req.connection.remoteAddress}`;

    if (res.statusCode >= 400) {
      logger.error(logMessage);
    } else {
      logger.info(logMessage);
    }
  });

  next();
};

export default requestLogger;
