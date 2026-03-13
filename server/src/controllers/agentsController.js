const storage = require('../storage')
const { normalizeAgent, LLM_PROVIDERS, getProviderForModel } = require('../models/agentModel')
const llmService = require('../services/llmService')
const conversationService = require('../services/conversationService')

async function create(req, res, next) {
  try {
    const payload = normalizeAgent(req.body || {})
    const created = await storage.create(payload)
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

async function getAll(req, res, next) {
  try {
    const list = await storage.getAll()
    // Filter to only agents (exclude users and other types)
    const agents = list.filter(item => item.id && item.id.startsWith('ag_'))
    res.json(agents)
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const id = req.params.id
    const item = await storage.getById(id)
    if (!item) return res.status(404).json({ error: 'agent not found' })
    res.json(item)
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const id = req.params.id
    // only apply provided fields
    const body = req.body || {}
    const patch = {}
    if (body.name !== undefined) patch.name = body.name
    if (body.avatar !== undefined) patch.avatar = body.avatar
    if (body.skills !== undefined) patch.skills = Array.isArray(body.skills) ? body.skills : (typeof body.skills === 'string' ? body.skills.split(',').map(s=>s.trim()).filter(Boolean) : [])
    if (body.responseStyle !== undefined) patch.responseStyle = body.responseStyle
    if (body.roles !== undefined) patch.roles = Array.isArray(body.roles) ? body.roles : (typeof body.roles === 'string' ? body.roles.split(',').map(s=>s.trim()).filter(Boolean) : [])
    
    // LLM configuration fields
    if (body.systemPrompt !== undefined) patch.systemPrompt = body.systemPrompt
    if (body.model !== undefined) patch.model = body.model
    if (body.temperature !== undefined) patch.temperature = body.temperature
    if (body.maxTokens !== undefined) patch.maxTokens = body.maxTokens

    const updated = await storage.update(id, patch)
    if (!updated) return res.status(404).json({ error: 'agent not found' })
    res.json(updated)
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id
    const ok = await storage.delete(id)
    if (!ok) return res.status(404).json({ error: 'agent not found' })
    // Also clean up any conversations for this agent
    conversationService.deleteConversationsByAgent(id)
    res.status(204).end()
  } catch (err) { next(err) }
}

/**
 * Chat with an agent
 * POST /api/agents/:id/chat
 * Body: { message: string, conversationId?: string }
 */
async function chat(req, res, next) {
  try {
    const agentId = req.params.id
    const { message, conversationId } = req.body

    // Get the agent
    const agent = await storage.getById(agentId)
    if (!agent) {
      return res.status(404).json({ error: 'agent not found' })
    }

    // Validate conversation if provided (check before LLM config so we can return proper 404)
    let conversation
    if (conversationId) {
      conversation = conversationService.getConversation(conversationId)
      if (!conversation) {
        return res.status(404).json({ error: 'conversation not found' })
      }
      if (conversation.agentId !== agentId) {
        return res.status(400).json({ error: 'conversation does not belong to this agent' })
      }
    }

    // Check if the provider is configured
    const provider = getProviderForModel(agent.model)
    if (!llmService.isProviderConfigured(provider)) {
      return res.status(503).json({ 
        error: 'llm_not_configured',
        message: `LLM provider '${provider}' is not configured. Please set the appropriate API key.`,
        provider
      })
    }

    // Create new conversation if not provided
    if (!conversation) {
      const userId = req.user?.id || null
      conversation = conversationService.createConversation(agentId, userId)
    }

    // Add user message to conversation
    conversationService.addMessage(conversation.id, 'user', message)

    // Get conversation history for context
    const history = conversationService.getMessages(conversation.id)

    // Call LLM
    const response = await llmService.chat(agent, history)

    // Add agent response to conversation
    const agentMessage = conversationService.addMessage(conversation.id, 'agent', response.content)

    res.json({
      conversationId: conversation.id,
      message: {
        id: agentMessage.id,
        role: 'agent',
        content: response.content,
        timestamp: agentMessage.timestamp
      },
      usage: response.usage,
      model: response.model
    })
  } catch (err) {
    // Handle specific LLM errors
    if (err.message.includes('API key')) {
      return res.status(503).json({ error: 'llm_auth_error', message: err.message })
    }
    if (err.message.includes('Rate limit')) {
      return res.status(429).json({ error: 'rate_limit', message: err.message })
    }
    next(err)
  }
}

/**
 * Get conversations for an agent
 * GET /api/agents/:id/conversations
 */
async function getConversations(req, res, next) {
  try {
    const agentId = req.params.id
    
    // Verify agent exists
    const agent = await storage.getById(agentId)
    if (!agent) {
      return res.status(404).json({ error: 'agent not found' })
    }

    const userId = req.user?.id || null
    const conversations = conversationService.getConversationsByAgent(agentId, userId)
    
    // Return summary (without full messages)
    const summary = conversations.map(conv => ({
      id: conv.id,
      messageCount: conv.messages.length,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      lastMessage: conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1].content.slice(0, 100)
        : null
    }))

    res.json(summary)
  } catch (err) { next(err) }
}

/**
 * Get a specific conversation
 * GET /api/agents/:id/conversations/:convId
 */
async function getConversation(req, res, next) {
  try {
    const { id: agentId, convId } = req.params

    const conversation = conversationService.getConversation(convId)
    if (!conversation) {
      return res.status(404).json({ error: 'conversation not found' })
    }
    if (conversation.agentId !== agentId) {
      return res.status(400).json({ error: 'conversation does not belong to this agent' })
    }

    res.json(conversation)
  } catch (err) { next(err) }
}

/**
 * Delete a conversation
 * DELETE /api/agents/:id/conversations/:convId
 */
async function deleteConversation(req, res, next) {
  try {
    const { id: agentId, convId } = req.params

    const conversation = conversationService.getConversation(convId)
    if (!conversation) {
      return res.status(404).json({ error: 'conversation not found' })
    }
    if (conversation.agentId !== agentId) {
      return res.status(400).json({ error: 'conversation does not belong to this agent' })
    }

    conversationService.deleteConversation(convId)
    res.status(204).end()
  } catch (err) { next(err) }
}

/**
 * Get available LLM models
 * GET /api/agents/models
 */
async function getModels(req, res, next) {
  try {
    const available = llmService.getAvailableModels()
    const allModels = LLM_PROVIDERS
    
    res.json({
      available,
      all: allModels
    })
  } catch (err) { next(err) }
}

module.exports = { 
  create, 
  getAll, 
  getOne, 
  update, 
  remove,
  chat,
  getConversations,
  getConversation,
  deleteConversation,
  getModels
}
