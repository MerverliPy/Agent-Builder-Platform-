const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const healthRouter = require('./routes/health')
const agentsRouter = require('./routes/agents')
const authRouter = require('./routes/auth')
const mediaRouter = require('./routes/media')
const adminRouter = require('./routes/admin')
const reviewsRouter = require('./routes/reviews')
const mountUploads = require('./staticUploads')

function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use(morgan('dev'))

  app.get('/', (req, res) => res.send('Custom Agent Builder Platform API'))

  app.use('/api/health', healthRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/agents', agentsRouter)
  app.use('/api/media', mediaRouter)
  app.use('/api/reviews', reviewsRouter)
  
  // Test helpers - ONLY enable in test/development environments
  if (process.env.NODE_ENV === 'test' || process.env.ENABLE_TEST_ROUTES === 'true') {
    const testHelpersRouter = require('./routes/testHelpers')
    app.use('/api/test', testHelpersRouter)
    console.log('⚠️  Test helper routes enabled at /api/test')
  }
  
  mountUploads(app)

  const errorHandler = require('./middleware/errorHandler')
  app.use(errorHandler)

  // basic 404
  app.use((req, res) => res.status(404).json({ error: 'Not found' }))

  return app
}

module.exports = createApp
