import { Server } from "socket.io";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

// Fonction utilisée par ton consumer
export function pushNotification(notification) {
  if (!io) {
    console.warn("Socket not initialized");
    return;
  }

  // envoi global (simple pour ton projet)
  io.emit("notification", notification);
}