const { getChannel } = require("./rabbitmq");

/**
 * Consumes events from a specific queue
 * @param {string} queueName Name of the queue to assert and consume from
 * @param {string[]} routingKeys Array of routing keys (event names) to bind to the queue
 * @param {Function} callback Function to call when a message is received
 */
async function consumeEvents(queueName, routingKeys, callback) {
  const channel = getChannel();
  if (!channel) {
    console.warn(`[EVENT BUS] Cannot consume ${queueName}, channel not ready. Retrying in 5s...`);
    setTimeout(() => consumeEvents(queueName, routingKeys, callback), 5000);
    return;
  }

  try {
    const exchangeName = 'erp_events';
    
    // Ensure exchange exists
    await channel.assertExchange(exchangeName, 'topic', { durable: true });

    // Ensure queue exists
    await channel.assertQueue(queueName, { durable: true });

    // Bind queue to exchange for each routing key
    for (const key of routingKeys) {
      await channel.bindQueue(queueName, exchangeName, key);
    }

    console.log(`[EVENT BUS] Consumer ready on queue '${queueName}', bound to keys: ${routingKeys.join(', ')}`);

    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;
          
          await callback(routingKey, content);
          
          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          console.error(`[EVENT BUS] Error processing message on queue '${queueName}':`, error);
          // If the error is fatal for the message, we could reject it
          // For simplicity, we just nack and let it requeue or discard based on DLQ settings
          // Here we just ack to avoid infinite loops of poison messages
          channel.ack(msg);
        }
      }
    });

  } catch (error) {
    console.error(`[EVENT BUS] Failed to setup consumer on '${queueName}':`, error);
  }
}

module.exports = { consumeEvents };
