const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FestBuz API',
      version: '1.0.0',
      description: 'API documentation for FestBuz backend',
    },
    servers: [
      { url: 'http://localhost:8000' },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to your API route files
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs }; 