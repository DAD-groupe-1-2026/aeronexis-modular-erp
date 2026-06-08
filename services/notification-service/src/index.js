import express from "express";
import http from "http";
import dotenv from "dotenv";

import { initSocket } from "./websocket/socket.js";
import { startConsumer } from "./consumers/rabbitmq.consumer.js";
import { router } from "./routes/notification.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/notifications", router);

const server = http.createServer(app);

// IMPORTANT : Socket.IO branché ici
initSocket(server);

// RabbitMQ
startConsumer();

const PORT = process.env.PORT || 3006;

server.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});