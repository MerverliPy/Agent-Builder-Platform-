const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const healthRouter = require('./routes/health')
const agentsRouter = require('./routes/agents')
const authRouter = require('./routes/auth')
const mediaRouter = require('./routes/media')
const mountUploads = require('./staticUploads')

function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use(morgan('dev'))

  app.get('/', (req, res) => res.send('Custom Agent Builder Platform API'))

  app.use('/api/health', healthRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/agents', agentsRouter)
  app.use('/api/media', mediaRouter)
  mountUploads(app)

  const errorHandler = require('./middleware/errorHandler')
  app.use(errorHandler)

  // basic 404
  app.use((req, res) => res.status(404).json({ error: 'Not found' }))

  return app
}

module.exports = createApp
