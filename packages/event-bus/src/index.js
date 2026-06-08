const {connectRabbitMQ} = require("./rabbitmq");

const {publishEvent} = require("./publisher");

const EVENTS =require("./events");

module.exports = {

  connectRabbitMQ,
  publishEvent,
  EVENTS
};