// Environment variable must be accessed at module level
const BASE = import.meta.env.VITE_API_BASE || '/api'
console.log('[API] Using base URL:', BASE)

function authHeader() {
  try {
    const token = window.localStorage.getItem('cabp_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch (err) { return {} }
}

async function ping() {
  const res = await fetch(`${BASE}/health`)
  if (!res.ok) throw new Error('health check failed')
  return res.json()
}

async function getAgents() {
  const res = await fetch(`${BASE}/agents`)
  if (!res.ok) throw new Error('failed')
  return res.json()
}

async function getAgent(id) {
  const res = await fetch(`${BASE}/agents/${id}`)
  if (!res.ok) throw new Error('not found')
  return res.json()
}

async function createAgent(payload) {
  const res = await fetch(`${BASE}/agents`, { method: 'POST', headers: Object.assign({'Content-Type':'application/json'}, authHeader()), body: JSON.stringify(payload) })
  if (!res.ok) {
    const err = await res.json().catch(()=>({error:'unknown'}))
    throw new Error(err.error || 'create failed')
  }
  return res.json()
}

async function updateAgent(id, payload) {
  const res = await fetch(`${BASE}/agents/${id}`, { method: 'PUT', headers: Object.assign({'Content-Type':'application/json'}, authHeader()), body: JSON.stringify(payload) })
  if (!res.ok) {
    const err = await res.json().catch(()=>({error:'unknown'}))
    throw new Error(err.error || 'update failed')
  }
  return res.json()
}

async function deleteAgent(id) {
  const res = await fetch(`${BASE}/agents/${id}`, { method: 'DELETE', headers: authHeader() })
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(()=>({error:'unknown'}))
    throw new Error(err.error || 'delete failed')
  }
  return true
}

// ============================================
// Chat / Conversation API
// ============================================

/**
 * Send a message to an agent and get a response
 * @param {string} agentId - The agent ID
 * @param {string} message - The user's message
 * @param {string|null} conversationId - Optional existing conversation ID
 * @returns {Promise<{conversationId: string, message: object, usage: object, model: string}>}
 */
async function chatWithAgent(agentId, message, conversationId = null) {
  const body = { message }
  if (conversationId) body.conversationId = conversationId
  
  const res = await fetch(`${BASE}/agents/${agentId}/chat`, {
    method: 'POST',
    headers: Object.assign({'Content-Type':'application/json'}, authHeader()),
    body: JSON.stringify(body)
  })
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }))
    // Create error with extra info for the UI to handle
    const error = new Error(err.message || err.error || 'chat failed')
    error.code = err.error
    error.provider = err.provider
    throw error
  }
  
  return res.json()
}

/**
 * Get list of conversations for an agent
 */
async function getConversations(agentId) {
  const res = await fetch(`${BASE}/agents/${agentId}/conversations`, {
    headers: authHeader()
  })
  if (!res.ok) throw new Error('failed to get conversations')
  return res.json()
}

/**
 * Get a specific conversation with all messages
 */
async function getConversation(agentId, conversationId) {
  const res = await fetch(`${BASE}/agents/${agentId}/conversations/${conversationId}`, {
    headers: authHeader()
  })
  if (!res.ok) throw new Error('conversation not found')
  return res.json()
}

/**
 * Delete a conversation
 */
async function deleteConversation(agentId, conversationId) {
  const res = await fetch(`${BASE}/agents/${agentId}/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: authHeader()
  })
  if (!res.ok && res.status !== 204) throw new Error('failed to delete conversation')
  return true
}

/**
 * Get available LLM models
 */
async function getModels() {
  const res = await fetch(`${BASE}/agents/models`)
  if (!res.ok) throw new Error('failed to get models')
  return res.json()
}

export default { 
  ping, 
  getAgents, 
  getAgent, 
  createAgent,
  updateAgent,
  deleteAgent,
  // Chat API
  chatWithAgent,
  getConversations,
  getConversation,
  deleteConversation,
  getModels
}
