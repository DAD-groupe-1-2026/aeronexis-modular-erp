const {getChannel} = require("./rabbitmq");

const QUEUE_NAME ="audit_events";

async function publishEvent(
  eventType,
  service,
  data
) {

  const channel =getChannel();

  if (!channel) {
    throw new Error(
      "RabbitMQ channel unavailable"
    );
  }

  const payload = {

    eventType,

    service,

    timestamp:
      new Date(),

    data
  };

  channel.sendToQueue(
    'audit_events',
    Buffer.from(
      JSON.stringify(payload)
    ),
    {
      persistent: true
    }
  );

  channel.sendToQueue(
    'events',
    Buffer.from(
      JSON.stringify(payload)
    ),
    {
      persistent: true
    }
  );

  channel.publish(
    'erp_events',
    eventType,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  );

  console.log(
    `[EVENT BUS] ${eventType}`
  );
}

module.exports = {publishEvent};