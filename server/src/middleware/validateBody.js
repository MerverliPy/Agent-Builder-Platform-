const { isNonEmptyString, isArrayOfStrings } = require('../utils/validators')
const { isValidModel } = require('../models/agentModel')

function validateCreateAgent(req, res, next) {
  const { name, skills, responseStyle, roles, systemPrompt, model, temperature, maxTokens } = req.body || {}
  const errors = []
  if (!isNonEmptyString(name)) errors.push('name is required')
  if (skills !== undefined && !(Array.isArray(skills) || typeof skills === 'string')) errors.push('skills must be an array or comma string')
  if (roles !== undefined && !(Array.isArray(roles) || typeof roles === 'string')) errors.push('roles must be an array or comma string')
  
  // LLM field validation
  if (systemPrompt !== undefined && typeof systemPrompt !== 'string') errors.push('systemPrompt must be a string')
  if (model !== undefined && !isValidModel(model)) errors.push('model must be a supported LLM model')
  if (temperature !== undefined && (typeof temperature !== 'number' || temperature < 0 || temperature > 2)) errors.push('temperature must be a number between 0 and 2')
  if (maxTokens !== undefined && (typeof maxTokens !== 'number' || maxTokens < 1 || maxTokens > 8192)) errors.push('maxTokens must be a number between 1 and 8192')
  
  if (errors.length) return res.status(400).json({ error: 'validation error', details: errors })
  next()
}

function validateUpdateAgent(req, res, next) {
  const { name, skills, responseStyle, roles, systemPrompt, model, temperature, maxTokens } = req.body || {}
  const errors = []
  if (name !== undefined && !isNonEmptyString(name)) errors.push('name must be a non-empty string')
  if (skills !== undefined && !(Array.isArray(skills) || typeof skills === 'string')) errors.push('skills must be an array or comma string')
  if (roles !== undefined && !(Array.isArray(roles) || typeof roles === 'string')) errors.push('roles must be an array or comma string')
  
  // LLM field validation
  if (systemPrompt !== undefined && typeof systemPrompt !== 'string') errors.push('systemPrompt must be a string')
  if (model !== undefined && !isValidModel(model)) errors.push('model must be a supported LLM model')
  if (temperature !== undefined && (typeof temperature !== 'number' || temperature < 0 || temperature > 2)) errors.push('temperature must be a number between 0 and 2')
  if (maxTokens !== undefined && (typeof maxTokens !== 'number' || maxTokens < 1 || maxTokens > 8192)) errors.push('maxTokens must be a number between 1 and 8192')
  
  if (errors.length) return res.status(400).json({ error: 'validation error', details: errors })
  next()
}

/**
 * Validate chat request body
 */
function validateChatRequest(req, res, next) {
  const { message, conversationId } = req.body || {}
  const errors = []
  
  if (!isNonEmptyString(message)) errors.push('message is required and must be a non-empty string')
  if (conversationId !== undefined && typeof conversationId !== 'string') errors.push('conversationId must be a string')
  
  if (errors.length) return res.status(400).json({ error: 'validation error', details: errors })
  next()
}

module.exports = { validateCreateAgent, validateUpdateAgent, validateChatRequest }
