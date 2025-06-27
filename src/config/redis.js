const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  }
});

client.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

client.on('connect', () => {
  console.log('✅ Redis connected');
});

client.connect();

module.exports = client;
