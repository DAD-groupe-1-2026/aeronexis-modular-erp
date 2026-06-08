const express = require('express');

const connectMongo = require('./db/mongo');

const startConsumer =
  require('./rabbitmq/consumer');

const app = express();

app.use(express.json());

connectMongo();

startConsumer();

app.listen(3005, () => {
  console.log(
    'Traceability Service started'
  );
});