const amqp = require('amqplib');

const AuditLog = require('../models/AuditLog');

const QUEUE_NAME = 'audit_events';

async function startConsumer() {
  try {
    const connection = await amqp.connect(
      process.env.RABBITMQ_URL
    );

    const channel =
      await connection.createChannel();

    await channel.assertQueue(
      QUEUE_NAME,
      {
        durable: true
      }
    );

    console.log(
      'Listening RabbitMQ queue'
    );

    channel.consume(
      QUEUE_NAME,
      async (msg) => {

        if (!msg) return;

        const event =
          JSON.parse(
            msg.content.toString()
          );

        await AuditLog.create({
          eventType: event.eventType,
          service: event.service,
          userId: event.userId,
          data: event.data
        });

        channel.ack(msg);
      }
    );
  } catch (error) {
    console.error(error);
  }
}

module.exports = startConsumer;