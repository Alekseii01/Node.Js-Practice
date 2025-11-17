const WebSocket = require('ws');

let wss = null;

function initializeWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');

    ws.on('error', console.error);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return wss;
}

function broadcastNotification(type, data) {
  if (!wss) {
    console.warn('WebSocket server not initialized');
    return;
  }

  const notification = {
    type,
    data,
    timestamp: new Date().toISOString()
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  });
}

module.exports = {
  initializeWebSocket,
  broadcastNotification
};
