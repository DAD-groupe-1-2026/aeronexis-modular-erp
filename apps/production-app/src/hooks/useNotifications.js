import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Le gateway NGINX proxifiera automatiquement /socket.io/ vers notification-service
    const socket = io();

    socket.on("connect", () => {
      console.log("Connected to notification service");
    });

    socket.on("notification", (data) => {
      console.log("Notification reçue :", data);

      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return notifications;
}