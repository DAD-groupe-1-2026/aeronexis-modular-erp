import { useNotifications } from "./hooks/useNotifications";

export default function Notifications() {
  const notifications = useNotifications();

  return (
    <div>
      <h2>Notifications</h2>

      {notifications.map((n) => (
        <div key={n.id} style={{ border: "1px solid #ccc", margin: 10 }}>
          <h4>{n.title}</h4>
          <p>{n.message}</p>
          <small>{n.type}</small>
        </div>
      ))}
    </div>
  );
}