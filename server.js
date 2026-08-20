const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log(`[+] Unit Connected: ${socket.id}`);

  socket.on('gps-update', (data) => {
    io.emit('telemetry-broadcast', data);
  });

  socket.on('disconnect', () => {
    console.log(`[-] Unit Disconnected: ${socket.id}`);
  });
});

// Dynamic port assignment for cloud deployment (Render/Railway)
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CommandSync Server running on port ${PORT}`);
});