module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  storage: process.env.CABP_STORAGE || 'memory',
  dbFile: process.env.CABP_DB_FILE || null,
  cleanup: {
    // Enable in-process periodic cleanup when true. Default: false.
    enabled: (process.env.PROCESS_CLEANUP === 'true') || (process.env.CABP_CLEANUP === 'true') || false,
    // Interval in minutes between cleanup runs (default 60)
    intervalMinutes: Number(process.env.CABP_CLEANUP_INTERVAL_MIN) || 60,
    // TTL hours: files older than this are eligible for deletion (default 24)
    ttlHours: process.env.CABP_CLEANUP_TTL ? Number(process.env.CABP_CLEANUP_TTL) : 24,
    // If true, scheduled cleanup logs are emitted as JSON objects
    logJson: (process.env.CABP_CLEANUP_LOG_JSON === 'true') || false
  }
}
