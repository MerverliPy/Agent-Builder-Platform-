/**
 * LLM Service - Unified interface for OpenAI, Anthropic, and Ollama
 * 
 * Provides a consistent API for chat completions across different providers.
 * Ollama provides free, open-source local LLM inference.
 */

const config = require('../config')
const { getProviderForModel, LLM_DEFAULTS } = require('../models/agentModel')

/**
 * LLM Service class that handles communication with different LLM providers
 */
class LLMService {
  constructor() {
    this.openaiClient = null
    this.anthropicClient = null
    this.ollamaAvailable = null // cached availability check
  }

  /**
   * Lazy-load OpenAI client
   */
  async getOpenAIClient() {
    if (!this.openaiClient) {
      const apiKey = config.llm.openai.apiKey
      if (!apiKey) {
        throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable.')
      }
      const OpenAI = (await import('openai')).default
      this.openaiClient = new OpenAI({
        apiKey,
        baseURL: config.llm.openai.baseUrl
      })
    }
    return this.openaiClient
  }

  /**
   * Lazy-load Anthropic client
   */
  async getAnthropicClient() {
    if (!this.anthropicClient) {
      const apiKey = config.llm.anthropic.apiKey
      if (!apiKey) {
        throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable.')
      }
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      this.anthropicClient = new Anthropic({
        apiKey
      })
    }
    return this.anthropicClient
  }

  /**
   * Check if Ollama is available and reachable
   */
  async checkOllamaAvailability() {
    if (this.ollamaAvailable !== null) {
      return this.ollamaAvailable
    }
    
    try {
      const baseUrl = config.llm.ollama.baseUrl
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      this.ollamaAvailable = response.ok
    } catch (error) {
      this.ollamaAvailable = false
    }
    
    return this.ollamaAvailable
  }

  /**
   * Get list of models available in Ollama
   */
  async getOllamaModels() {
    try {
      const baseUrl = config.llm.ollama.baseUrl
      const response = await fetch(`${baseUrl}/api/tags`)
      if (!response.ok) {
        return []
      }
      const data = await response.json()
      return data.models ? data.models.map(m => m.name) : []
    } catch (error) {
      return []
    }
  }

  /**
   * Build system prompt from agent configuration
   */
  buildSystemPrompt(agent) {
    let systemPrompt = agent.systemPrompt || ''
    
    // If no explicit system prompt, build one from agent metadata
    if (!systemPrompt) {
      const parts = [`You are ${agent.name}.`]
      
      if (agent.roles && agent.roles.length > 0) {
        parts.push(`Your roles include: ${agent.roles.join(', ')}.`)
      }
      
      if (agent.skills && agent.skills.length > 0) {
        parts.push(`Your areas of expertise are: ${agent.skills.join(', ')}.`)
      }
      
      if (agent.responseStyle) {
        parts.push(`Communication style: ${agent.responseStyle}.`)
      }
      
      systemPrompt = parts.join(' ')
    }
    
    return systemPrompt
  }

  /**
   * Call OpenAI chat completion API
   */
  async chatWithOpenAI(agent, messages) {
    const client = await this.getOpenAIClient()
    const systemPrompt = this.buildSystemPrompt(agent)
    
    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'agent' ? 'assistant' : m.role,
        content: m.content
      }))
    ]

    const response = await client.chat.completions.create({
      model: agent.model || LLM_DEFAULTS.model,
      messages: openaiMessages,
      temperature: agent.temperature ?? LLM_DEFAULTS.temperature,
      max_tokens: agent.maxTokens ?? LLM_DEFAULTS.maxTokens
    })

    return {
      content: response.choices[0]?.message?.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens
      },
      model: response.model,
      finishReason: response.choices[0]?.finish_reason
    }
  }

  /**
   * Call Anthropic chat completion API
   */
  async chatWithAnthropic(agent, messages) {
    const client = await this.getAnthropicClient()
    const systemPrompt = this.buildSystemPrompt(agent)

    // Anthropic uses a different message format
    const anthropicMessages = messages.map(m => ({
      role: m.role === 'agent' ? 'assistant' : m.role,
      content: m.content
    }))

    const response = await client.messages.create({
      model: agent.model || 'claude-3-5-sonnet-20241022',
      max_tokens: agent.maxTokens ?? LLM_DEFAULTS.maxTokens,
      system: systemPrompt,
      messages: anthropicMessages
    })

    // Extract text content from Anthropic's response
    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')

    return {
      content: textContent,
      usage: {
        promptTokens: response.usage?.input_tokens,
        completionTokens: response.usage?.output_tokens,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
      },
      model: response.model,
      finishReason: response.stop_reason
    }
  }

  /**
   * Call Ollama chat completion API
   * Ollama uses an OpenAI-compatible API format
   */
  async chatWithOllama(agent, messages) {
    const baseUrl = config.llm.ollama.baseUrl
    const systemPrompt = this.buildSystemPrompt(agent)
    
    // Format messages for Ollama (OpenAI-compatible format)
    const ollamaMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'agent' ? 'assistant' : m.role,
        content: m.content
      }))
    ]

    const requestBody = {
      model: agent.model || 'llama3.2',
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature: agent.temperature ?? LLM_DEFAULTS.temperature,
        num_predict: agent.maxTokens ?? LLM_DEFAULTS.maxTokens
      }
    }

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ollama request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    return {
      content: data.message?.content || '',
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      },
      model: data.model,
      finishReason: data.done ? 'stop' : 'length'
    }
  }

  /**
   * Main chat method - routes to appropriate provider
   * 
   * @param {Object} agent - The agent configuration
   * @param {Array} messages - Array of {role, content} message objects
   * @returns {Promise<Object>} - Response object with content and metadata
   */
  async chat(agent, messages) {
    const model = agent.model || LLM_DEFAULTS.model
    const provider = getProviderForModel(model)

    if (!provider) {
      throw new Error(`Unsupported model: ${model}`)
    }

    try {
      if (provider === 'openai') {
        return await this.chatWithOpenAI(agent, messages)
      } else if (provider === 'anthropic') {
        return await this.chatWithAnthropic(agent, messages)
      } else if (provider === 'ollama') {
        return await this.chatWithOllama(agent, messages)
      } else {
        throw new Error(`Provider not implemented: ${provider}`)
      }
    } catch (error) {
      // Wrap provider errors with more context
      if (error.status === 401) {
        throw new Error(`Authentication failed for ${provider}. Check your API key.`)
      }
      if (error.status === 429) {
        throw new Error(`Rate limit exceeded for ${provider}. Please try again later.`)
      }
      if (error.status === 400) {
        throw new Error(`Invalid request to ${provider}: ${error.message}`)
      }
      // Ollama connection errors
      if (error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Ollama at ${config.llm.ollama.baseUrl}. Is Ollama running?`)
      }
      throw error
    }
  }

  /**
   * Check if a provider is configured (has API key or is available)
   */
  isProviderConfigured(provider) {
    if (provider === 'openai') {
      return !!config.llm.openai.apiKey
    }
    if (provider === 'anthropic') {
      return !!config.llm.anthropic.apiKey
    }
    if (provider === 'ollama') {
      // Ollama is "configured" if enabled via env var
      // The actual availability check happens asynchronously
      return config.llm.ollama.enabled
    }
    return false
  }

  /**
   * Async version to check if provider is actually available
   * (useful for Ollama which needs network check)
   */
  async isProviderAvailable(provider) {
    if (provider === 'ollama') {
      return await this.checkOllamaAvailability()
    }
    return this.isProviderConfigured(provider)
  }

  /**
   * Get list of available models (only from configured providers)
   */
  getAvailableModels() {
    const { LLM_PROVIDERS } = require('../models/agentModel')
    const available = {}
    
    for (const [provider, models] of Object.entries(LLM_PROVIDERS)) {
      if (this.isProviderConfigured(provider)) {
        available[provider] = models
      }
    }
    
    return available
  }

  /**
   * Reset Ollama availability cache (useful after config changes)
   */
  resetOllamaCache() {
    this.ollamaAvailable = null
  }
}

// Export singleton instance
const llmService = new LLMService()

module.exports = llmService
