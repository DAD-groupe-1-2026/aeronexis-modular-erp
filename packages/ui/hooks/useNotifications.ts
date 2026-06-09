import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
// @ts-ignore
import { apiClient } from "@aeronexis-dynamics/api-client";

export function useNotifications(appName?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Charger l'historique des notifications
    async function fetchHistory() {
      try {
        const res = await apiClient.get<any[]>('/api/notifications/system');
        if (res.status === 'success' && Array.isArray(res.data)) {
          const filtered = res.data.filter(data => {
            if (appName && data.targetApp && data.targetApp !== appName) return false;
            return true;
          });
          setNotifications(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch historical notifications", err);
      }
    }
    fetchHistory();
  }, [appName]);

  useEffect(() => {
    // Le gateway NGINX proxifiera automatiquement /socket.io/ vers notification-service
    const socket = io();

    socket.on("connect", () => {
      console.log("Connected to notification service");
    });

    socket.on("notification", (data) => {
      console.log("Notification reçue :", data);
      
      // Filtrer par application cible si spécifiée
      if (appName && data.targetApp && data.targetApp !== appName) {
        return;
      }

      // Afficher la notification (toast) visuelle
      if (data.type === 'error' || data.type === 'warning') {
        toast.error(data.title, { description: data.message });
      } else if (data.type === 'success') {
        toast.success(data.title, { description: data.message });
      } else {
        toast.info(data.title, { description: data.message });
      }

      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return notifications;
}