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
  },
  // LLM Provider Configuration
  llm: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || null,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || null
    },
    // Ollama - Free, open-source local LLM server (https://ollama.ai)
    // No API key required, just needs Ollama running locally or on a network host
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      // Set to 'true' to enable Ollama (it's free, so we just check if it's reachable)
      enabled: process.env.OLLAMA_ENABLED === 'true' || false
    },
    // Default settings when not specified per-agent
    defaults: {
      provider: process.env.DEFAULT_LLM_PROVIDER || 'openai',
      model: process.env.DEFAULT_LLM_MODEL || 'gpt-4o-mini',
      temperature: parseFloat(process.env.DEFAULT_LLM_TEMPERATURE) || 0.7,
      maxTokens: parseInt(process.env.DEFAULT_LLM_MAX_TOKENS, 10) || 1024
    }
  }
}
