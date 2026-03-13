/**
 * Conversation Service - Manages chat conversation history
 * 
 * Stores conversations in memory with optional persistence via the storage layer.
 */

const { genId } = require('../utils/id')

/**
 * In-memory conversation store
 * In production, this should use the storage layer for persistence
 */
const conversations = new Map()

/**
 * Create a new conversation
 */
function createConversation(agentId, userId = null) {
  const id = genId('conv_')
  const conversation = {
    id,
    agentId,
    userId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  conversations.set(id, conversation)
  return conversation
}

/**
 * Get a conversation by ID
 */
function getConversation(conversationId) {
  return conversations.get(conversationId) || null
}

/**
 * Get all conversations for an agent (optionally filtered by user)
 */
function getConversationsByAgent(agentId, userId = null) {
  const results = []
  for (const conv of conversations.values()) {
    if (conv.agentId === agentId) {
      if (userId === null || conv.userId === userId) {
        results.push(conv)
      }
    }
  }
  // Sort by most recent first
  return results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

/**
 * Add a message to a conversation
 */
function addMessage(conversationId, role, content) {
  const conversation = conversations.get(conversationId)
  if (!conversation) {
    throw new Error('Conversation not found')
  }
  
  const message = {
    id: genId('msg_'),
    role,
    content,
    timestamp: new Date().toISOString()
  }
  
  conversation.messages.push(message)
  conversation.updatedAt = new Date().toISOString()
  
  return message
}

/**
 * Get messages from a conversation
 */
function getMessages(conversationId, limit = 50, offset = 0) {
  const conversation = conversations.get(conversationId)
  if (!conversation) {
    return []
  }
  
  const messages = conversation.messages
  const start = Math.max(0, messages.length - limit - offset)
  const end = messages.length - offset
  
  return messages.slice(start, end)
}

/**
 * Delete a conversation
 */
function deleteConversation(conversationId) {
  return conversations.delete(conversationId)
}

/**
 * Clear all messages in a conversation (keep the conversation itself)
 */
function clearConversation(conversationId) {
  const conversation = conversations.get(conversationId)
  if (!conversation) {
    return false
  }
  
  conversation.messages = []
  conversation.updatedAt = new Date().toISOString()
  return true
}

/**
 * Delete all conversations for an agent
 */
function deleteConversationsByAgent(agentId) {
  let count = 0
  for (const [id, conv] of conversations.entries()) {
    if (conv.agentId === agentId) {
      conversations.delete(id)
      count++
    }
  }
  return count
}

/**
 * Get conversation count (for monitoring)
 */
function getConversationCount() {
  return conversations.size
}

module.exports = {
  createConversation,
  getConversation,
  getConversationsByAgent,
  addMessage,
  getMessages,
  deleteConversation,
  clearConversation,
  deleteConversationsByAgent,
  getConversationCount
}
