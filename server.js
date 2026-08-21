const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log(`[+] Unit Connected: ${socket.id}`);

  // 1. Relay live responder GPS telemetry
  socket.on('gps-update', (data) => {
    io.emit('telemetry-broadcast', data);
  });

  // 2. Relay live citizen SOS distress alerts
  socket.on('send-sos', (data) => {
    console.log(`[🚨 SOS ALERT] ${data.id} created at Lat: ${data.lat}, Lng: ${data.lng}`);
    io.emit('sos-broadcast', data);
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