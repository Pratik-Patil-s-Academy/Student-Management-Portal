import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Student Management Portal API',
            version: '1.0.0',
            description: 'API documentation for the Student Management Portal',
        },
        servers: [
            {
                url: 'http://localhost:5005',
                description: 'Local server',
            },
            {
                url: 'https://student-management-portal-jtx5.onrender.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
