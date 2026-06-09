const express = require('express');

const connectMongo = require('./db/mongo');
const startConsumer = require('./rabbitmq/consumer');
const logsRoutes = require('./routes/logs.routes');

const app = express();

app.use(express.json());

// Routes
app.use('/api/traceability/logs', logsRoutes);

async function bootstrap() {
  try {
    await connectMongo();

    await startConsumer();

    app.listen(3005, () => {
      console.log(
        'Traceability Service started'
      );
    });
  } catch (error) {
    console.error(
      'Startup error:',
      error
    );

    process.exit(1);
  }
}

bootstrap();