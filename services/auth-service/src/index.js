require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./db/sequelize')
const authRoutes = require('./routes/auth.routes')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/auth', authRoutes)

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }))

// Connexion DB puis démarrage
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected.')
    return app.listen(PORT, () =>
      console.log(`auth-service running on port ${PORT}`),
    )
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  })
