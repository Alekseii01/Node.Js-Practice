const app = require('./app');
const path = require('path');
const http = require('http');
const { initializeWebSocket } = require('./websocket/notificationService');

require('dotenv').config({ path: path.join(__dirname, '.env.dev'), quiet: true });
const PORT = process.env.VITE_API_PORT || 3001;
if (!process.env.VITE_API_PORT) {
  console.warn('VITE_API_PORT is not set. Using default port 3001.');
}

const server = http.createServer(app);

initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
