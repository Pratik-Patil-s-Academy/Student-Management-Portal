import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import corsOptions from './config/cors.js';
import swaggerSpec from './config/swagger.js';
import requestLogger from './middlewares/requestLogger.middleware.js';
import errorHandler from './middlewares/errorHandler.middleware.js';
import routes from './routes/index.js';

const app = express();

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

app.use('/api', routes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;
