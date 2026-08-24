const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Serve static frontend files from the public folder
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log(`[+] Node Connected: ${socket.id}`);

  // 1. Citizen SOS event -> Relayed to Master Control Room
  socket.on('citizen-sos-alert', (data) => {
    console.log(`[🚨 SOS DISTRESS] ${data.id} (${data.type}) at Lat: ${data.lat}, Lng: ${data.lng}`);
    io.emit('citizen-sos-broadcast', data);
  });

  // 2. Control Room Dispatch order -> Relayed to field responders
  socket.on('control-dispatch-order', (data) => {
    console.log(`[⚡ DISPATCH] ${data.sosId} assigned to ${data.agency}`);
    io.emit('agency-mission-assigned', data);
  });

  // 3. Field Responder Telemetry -> Broadcast live GPS coordinates
  socket.on('gps-update', (data) => {
    io.emit('telemetry-broadcast', data);
  });

  // 4. Dynamic Hazard Scale Slider -> Synchronize polygon geometry across all screens
  socket.on('update-hazard-level', (data) => {
    io.emit('hazard-level-changed', data);
  });

  socket.on('disconnect', () => {
    console.log(`[-] Node Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`CommandSync Multi-Role Gateway running on port ${PORT}`);
});