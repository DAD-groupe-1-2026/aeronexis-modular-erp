const amqp = require("amqplib");

let connection;
let channel;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(
      process.env.RABBITMQ_URL
    );

    channel =
      await connection.createChannel();

    // Assert the new exchange
    await channel.assertExchange('erp_events', 'topic', { durable: true });
    
    // Ensure old queues exist so they don't crash
    await channel.assertQueue('audit_events', { durable: true });
    await channel.assertQueue('events', { durable: true });

    console.log(
      "[EVENT BUS] RabbitMQ connected"
    );

    return channel;
  }
  catch (error) {

    console.error(
      "[EVENT BUS] RabbitMQ unavailable"
    );

    setTimeout(
      connectRabbitMQ,
      5000
    );
  }
}

function getChannel() {
  return channel;
}

module.exports = {
  connectRabbitMQ,
  getChannel
};