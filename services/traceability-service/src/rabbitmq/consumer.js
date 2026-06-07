const amqp = require("amqplib");
const AuditLog = require("../models/AuditLog");

const QUEUE_NAME = "audit_events";

async function startConsumer() {
  while (true) {
    try {
      console.log("Connecting to RabbitMQ...");

      const connection = await amqp.connect(
        process.env.RABBITMQ_URL
      );

      const channel = await connection.createChannel();

      await channel.assertQueue(QUEUE_NAME, {
        durable: true,
      });

      console.log("Listening RabbitMQ queue");

      channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) return;

        const event = JSON.parse(msg.content.toString());

        console.log("Event received:", event);

        await AuditLog.create({
          eventType: event.eventType,
          service: event.service,
          userId: event.userId,
          data: event.data,
        });

        channel.ack(msg);
      });

      break; // STOP retry loop si OK

    } catch (error) {
      console.error("RabbitMQ not ready, retrying in 5s...");
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}
module.exports = startConsumer;
