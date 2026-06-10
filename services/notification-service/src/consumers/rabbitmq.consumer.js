import amqp from "amqplib";
import { buildNotification } from "../services/notification.service.js";
import { saveNotification } from "../db/redis.js";
import { pushNotification } from "../websocket/socket.js";

export async function startConsumer() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    const queue = "events";

    await channel.assertQueue(queue, { durable: true });

    console.log("RabbitMQ consumer started");

    channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        // 1. Parse event
        const event = JSON.parse(msg.content.toString());

        // 2. Transform event → notification métier
        const notification = buildNotification(event);

        // Si event ignoré
        if (!notification) {
          channel.ack(msg);
          return;
        }

        // 3. Save (Redis)
        await saveNotification(notification.userId, notification);

        // 4. Push real-time (Socket.IO)
        pushNotification(notification);

        console.log("Notification sent:", notification);

        // 5. ACK RabbitMQ
        channel.ack(msg);
      } catch (err) {
        console.error("Consumer error:", err);

        // Option: retry later
        channel.nack(msg, false, false);
      }
    });
  } catch (err) {
    console.error("RabbitMQ connection error:", err.message);
    console.log("Retrying in 5 seconds...");
    setTimeout(startConsumer, 5000);
  }
}