require("dotenv").config();
const express = require("express");
const connectDB = require("./database/connectDb");
const route = require("./routes");
const cors = require("cors");
const { initWebSocket } = require("./services/websocket");

const app = express();


// CORS setup
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// Connect to DB
connectDB();

// Define routes
app.use("/v1", route);

// Set up HTTP server
const server = app.listen(process.env.PORT || 8001, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// Initialize WebSocket
initWebSocket(server);
