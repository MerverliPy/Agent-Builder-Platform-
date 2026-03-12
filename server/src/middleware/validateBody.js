const { isNonEmptyString, isArrayOfStrings } = require('../utils/validators')

function validateCreateAgent(req, res, next) {
  const { name, skills, responseStyle, roles } = req.body || {}
  const errors = []
  if (!isNonEmptyString(name)) errors.push('name is required')
  if (skills !== undefined && !(Array.isArray(skills) || typeof skills === 'string')) errors.push('skills must be an array or comma string')
  if (roles !== undefined && !(Array.isArray(roles) || typeof roles === 'string')) errors.push('roles must be an array or comma string')
  if (errors.length) return res.status(400).json({ error: 'validation error', details: errors })
  next()
}

function validateUpdateAgent(req, res, next) {
  const { name, skills, responseStyle, roles } = req.body || {}
  const errors = []
  if (name !== undefined && !isNonEmptyString(name)) errors.push('name must be a non-empty string')
  if (skills !== undefined && !(Array.isArray(skills) || typeof skills === 'string')) errors.push('skills must be an array or comma string')
  if (roles !== undefined && !(Array.isArray(roles) || typeof roles === 'string')) errors.push('roles must be an array or comma string')
  if (errors.length) return res.status(400).json({ error: 'validation error', details: errors })
  next()
}

module.exports = { validateCreateAgent, validateUpdateAgent }
