const amqplib = require("amqplib");
async function sendEvent() {
  const connection = await amqplib.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();

  const queue = "events";

  await channel.assertQueue(queue, { durable: true });

  const event = {
    type: "ORDER_CREATED",
    orderId: 123,
    userId: 1
  };

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(event)));

  console.log("Event envoyé :", event);

  setTimeout(() => {
    connection.close();
  }, 500);
}

sendEvent();