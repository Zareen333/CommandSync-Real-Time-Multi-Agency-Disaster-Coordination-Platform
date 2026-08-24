const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log(`[+] Node Connected: ${socket.id}`);

  // 1. Relay real-time telemetry from phone or simulator
  socket.on('gps-update', (data) => {
    io.emit('telemetry-broadcast', data);
  });

  // 2. Relay citizen SOS distress alerts
  socket.on('send-sos', (data) => {
    console.log(`[🚨 SOS ALERT] ${data.id} at Lat: ${data.lat}, Lng: ${data.lng}`);
    io.emit('sos-broadcast', data);
  });

  // 3. Relay dynamic flood severity slider updates
  socket.on('update-hazard-level', (data) => {
    io.emit('hazard-level-changed', data);
  });

  socket.on('disconnect', () => {
    console.log(`[-] Node Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`CommandSync Engine running on port ${PORT}`);
});