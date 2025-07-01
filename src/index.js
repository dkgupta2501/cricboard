const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

const seriesRoutes = require('./routes/seriesRoutes');
const teamRoutes = require('./routes/teamRoutes');
const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');
const playingXiRoutes = require('./routes/playingXiRoutes');
const scoreEventRoutes = require('./routes/scoreEventRoutes');
const regionEventRoutes = require('./routes/regionRoutes');




// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/series', seriesRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/match_playing_xi', playingXiRoutes);
app.use('/api/score-events', scoreEventRoutes);
app.use('/api/region', regionEventRoutes);
// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../swagger-output.json'); // path to generated file

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));



// Sample route
// app.get('/api/ping', (req, res) => res.send('API is live'));

// Socket.IO setup
require('./sockets/commentarySocket')(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
