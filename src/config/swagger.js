const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cricket Live API",
      version: "1.0.0",
      description: "Live scoring backend with commentary",
    },
    servers: [
      {
        url: "https://cricboard.onrender.com", // ✅ Correct for local dev
        description: "Dev server"
      }
    ]
  },
  apis: ["./src/routes/*.js", "./src/docs/*.yaml"] // ✅ Supports both methods
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
