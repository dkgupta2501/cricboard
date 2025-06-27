const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Cricket Live API',
    description: 'Auto-generated Swagger documentation for live cricket scoring app',
  },
  host: 'localhost:5001',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/index.js']; // include any file where routes are registered

swaggerAutogen(outputFile, endpointsFiles, doc);
