// Supported LLM providers and their models
const LLM_PROVIDERS = {
  openai: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
  // Ollama - Free, open-source models (https://ollama.ai)
  // Users can run any model locally, these are the most popular ones
  ollama: [
    'llama3.2',           // Meta's Llama 3.2 (3B) - fast and capable
    'llama3.2:1b',        // Llama 3.2 1B - very fast, lightweight
    'llama3.1',           // Meta's Llama 3.1 (8B) - excellent quality
    'llama3.1:70b',       // Llama 3.1 70B - highest quality (needs lots of RAM)
    'mistral',            // Mistral 7B - fast and efficient
    'mixtral',            // Mixtral 8x7B MoE - very capable
    'phi3',               // Microsoft Phi-3 - small but powerful
    'phi3:medium',        // Phi-3 Medium (14B)
    'gemma2',             // Google Gemma 2 (9B)
    'gemma2:2b',          // Gemma 2 2B - lightweight
    'qwen2.5',            // Alibaba Qwen 2.5 (7B)
    'qwen2.5:14b',        // Qwen 2.5 14B
    'qwen2.5-coder:14b',  // Qwen 2.5 Coder 14B - specialized for coding
    'codellama',          // Meta's Code Llama - for coding tasks
    'deepseek-coder',     // DeepSeek Coder - excellent for code
  ]
}

// Default LLM settings
const LLM_DEFAULTS = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1024
}

/**
 * Get the provider for a given model name
 */
function getProviderForModel(model) {
  for (const [provider, models] of Object.entries(LLM_PROVIDERS)) {
    if (models.includes(model)) return provider
  }
  return null
}

/**
 * Validate model is supported
 */
function isValidModel(model) {
  return getProviderForModel(model) !== null
}

function normalizeAgent(payload) {
  // ensure required shape; caller handles validation
  const normalized = {
    id: payload.id,
    name: (payload.name || '').trim(),
    avatar: payload.avatar || null,
    skills: Array.isArray(payload.skills) ? payload.skills : (typeof payload.skills === 'string' && payload.skills.length ? payload.skills.split(',').map(s=>s.trim()).filter(Boolean) : []),
    responseStyle: payload.responseStyle || '',
    roles: Array.isArray(payload.roles) ? payload.roles : (payload.roles ? [payload.roles] : []),
    
    // LLM Configuration fields
    systemPrompt: typeof payload.systemPrompt === 'string' ? payload.systemPrompt.trim() : '',
    model: payload.model && isValidModel(payload.model) ? payload.model : LLM_DEFAULTS.model,
    temperature: typeof payload.temperature === 'number' && payload.temperature >= 0 && payload.temperature <= 2 
      ? payload.temperature 
      : LLM_DEFAULTS.temperature,
    maxTokens: typeof payload.maxTokens === 'number' && payload.maxTokens > 0 && payload.maxTokens <= 8192
      ? Math.floor(payload.maxTokens)
      : LLM_DEFAULTS.maxTokens,
  }
  
  return normalized
}

module.exports = { 
  normalizeAgent, 
  LLM_PROVIDERS, 
  LLM_DEFAULTS, 
  getProviderForModel, 
  isValidModel 
}
