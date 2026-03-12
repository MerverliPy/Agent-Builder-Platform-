#!/usr/bin/env node
const cleanup = require('../src/tasks/cleanupUploads')

async function run() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry') || args.includes('-d') || false
  // allow passing ttl in hours via --ttl=NUM
  let ttl = 24
  for (const a of args) {
    if (a.startsWith('--ttl=')) {
      const v = Number(a.split('=')[1])
      if (!Number.isNaN(v)) ttl = v
    }
  }

  try {
    const summary = await cleanup({ dryRun, ttlHours: ttl })
    if (process.env.CABP_CLEANUP_LOG_JSON === 'true') {
      console.log(JSON.stringify({ ts: new Date().toISOString(), summary }))
    } else {
      console.log('cleanup summary:', JSON.stringify(summary, null, 2))
    }
    process.exit(0)
  } catch (err) {
    if (process.env.CABP_CLEANUP_LOG_JSON === 'true') {
      console.error(JSON.stringify({ ts: new Date().toISOString(), error: String(err) }))
    } else {
      console.error('cleanup error:', err)
    }
    process.exit(2)
  }
}

run()
