// websocket.js
const { WebSocketServer } = require("ws");

let wss = null;

const initWebSocket = (server) => {
  // Initialize WebSocket server
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log("Received message:", message);
    });
    ws.send(JSON.stringify({ message: "Welcome to the WebSocket connection!" }));
  });
};

const broadcast = (data) => {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
};

module.exports = { initWebSocket, broadcast };
