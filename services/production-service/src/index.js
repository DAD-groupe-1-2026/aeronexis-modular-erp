require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./db/sequelize')
require('./models')
const productionRoutes = require('./routes/production.routes')

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/production', productionRoutes)

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'production-service' }))

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected.')
    return app.listen(PORT, () =>
      console.log(`production-service running on port ${PORT}`),
    )
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  })
