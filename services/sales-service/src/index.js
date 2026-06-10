require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./db/sequelize')
require('./models')
const salesRoutes = require('./routes/sales.routes')
const { connectRabbitMQ } = require('@aeronexis/event-bus')

const app = express()
const PORT = process.env.PORT || 3004

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/sales', salesRoutes)

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'sales-service' }))

sequelize
  .authenticate()
  .then(async () => {
    console.log('Database connected.')
    await connectRabbitMQ()
    return app.listen(PORT, () =>
      console.log(`sales-service running on port ${PORT}`),
    )
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  })
