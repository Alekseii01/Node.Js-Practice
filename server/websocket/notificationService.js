const WebSocket = require("ws");

let wss = null;
const userConnections = new Map();

function initializeWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("New WebSocket client connected");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "auth" && data.userId) {
          ws.userId = data.userId;

          if (!userConnections.has(data.userId)) {
            userConnections.set(data.userId, new Set());
          }
          userConnections.get(data.userId).add(ws);

          console.log(`WebSocket authenticated for user: ${data.userId}`);
        }
      } catch (err) {}
    });

    ws.on("error", console.error);

    ws.on("close", () => {
      if (ws.userId && userConnections.has(ws.userId)) {
        userConnections.get(ws.userId).delete(ws);
        if (userConnections.get(ws.userId).size === 0) {
          userConnections.delete(ws.userId);
        }
      }
      console.log("WebSocket client disconnected");
    });
  });

  return wss;
}

function broadcastNotification(type, data) {
  if (!wss) {
    console.warn("WebSocket server not initialized");
    return;
  }

  const notification = {
    type,
    data,
    timestamp: new Date().toISOString(),
  };

  console.log("Broadcasting WebSocket notification:", notification);
  console.log("Connected clients:", wss.clients.size);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  });
}

function sendToUser(userId, type, data) {
  if (!wss) {
    console.warn("WebSocket server not initialized");
    return;
  }

  const notification = {
    type,
    data,
    timestamp: new Date().toISOString(),
  };

  console.log(`Sending notification to user ${userId}:`, notification);

  const connections = userConnections.get(userId);
  if (connections && connections.size > 0) {
    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
        console.log(`Sent notification to user ${userId}`);
      }
    });
  } else {
    console.log(`No active connections for user ${userId}`);
  }
}

module.exports = {
  initializeWebSocket,
  broadcastNotification,
  sendToUser,
};
