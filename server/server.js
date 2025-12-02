const app = require('./app');
const path = require('path');
const http = require('http');
const { initializeWebSocket } = require('./websocket/notificationService');

require('dotenv').config({ path: path.join(__dirname, '.env.dev') });
const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
