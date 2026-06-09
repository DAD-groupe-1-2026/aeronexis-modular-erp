require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./db/sequelize')
require('./models')
const logisticsRoutes = require('./routes/logistics.routes')

const app = express()
const PORT = process.env.PORT || 3003

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/logistics', logisticsRoutes)

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'logistics-service' }))

sequelize
  .authenticate()
  .then(async () => {
    console.log('Database connected.')
    const { connectRabbitMQ } = require('@aeronexis/event-bus')
    await connectRabbitMQ()
    return app.listen(PORT, async () => {
      console.log(`[LOGISTICS] Service listening on port ${PORT}`)
      
      try {
        const { setupConsumers } = require('./consumer')
        await setupConsumers()
      } catch (err) {
        console.error('Failed to setup consumers:', err)
      }
    })
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  })
