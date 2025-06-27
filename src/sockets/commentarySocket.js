module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
  
      socket.on('new_ball_event', (data) => {
        console.log('Ball event received:', data);
        io.emit('ball_update', data);
      });
  
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  };
  