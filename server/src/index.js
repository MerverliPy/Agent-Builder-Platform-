const express = require('express')
const cors = require('cors')
const config = require('./config')

const createApp = require('./app')
const morgan = require('morgan')
const cleanupUploads = require('./tasks/cleanupUploads')

const app = createApp()

// Bind address can be set via HOST or BIND_ADDR env var. Default is localhost
const bindHost = process.env.HOST || process.env.BIND_ADDR || 'localhost'
const server = app.listen(config.port, bindHost, () => {
  console.log(`Server listening on http://${bindHost}:${config.port}`)
})

// optional in-process scheduler for cleanup
if (config.cleanup && config.cleanup.enabled) {
  const intervalMs = Math.max(1, Number(config.cleanup.intervalMinutes)) * 60 * 1000
  console.log(`Process cleanup enabled: running every ${config.cleanup.intervalMinutes} minutes (ttl ${config.cleanup.ttlHours}h)`)
  // run once on startup
  ;(async () => {
    try {
      const summary = await cleanupUploads({ dryRun: false, ttlHours: config.cleanup.ttlHours })
      if (config.cleanup.logJson || process.env.CABP_CLEANUP_LOG_JSON === 'true') {
        console.log(JSON.stringify({ ts: new Date().toISOString(), event: 'cleanup:startup', summary }))
      } else {
        console.log('initial cleanup summary:', JSON.stringify(summary, null, 2))
      }
    } catch (err) {
      console.error('initial cleanup error', err)
    }
  })()

  const timer = setInterval(async () => {
    try {
      const summary = await cleanupUploads({ dryRun: false, ttlHours: config.cleanup.ttlHours })
      if (config.cleanup.logJson || process.env.CABP_CLEANUP_LOG_JSON === 'true') {
        console.log(JSON.stringify({ ts: new Date().toISOString(), event: 'cleanup:scheduled', summary }))
      } else {
        console.log('scheduled cleanup summary:', JSON.stringify(summary, null, 2))
      }
    } catch (err) {
      console.error('scheduled cleanup error', err)
    }
  }, intervalMs)

  process.on('SIGINT', () => {
    clearInterval(timer)
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  })
} else {
  process.on('SIGINT', () => {
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  })
}
