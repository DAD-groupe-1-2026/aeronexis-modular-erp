import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io("http://localhost:3006");

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