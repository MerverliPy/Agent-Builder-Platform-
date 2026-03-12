function normalizeAgent(payload) {
  // ensure required shape; caller handles validation
  return {
    id: payload.id,
    name: (payload.name || '').trim(),
    avatar: payload.avatar || null,
    skills: Array.isArray(payload.skills) ? payload.skills : (typeof payload.skills === 'string' && payload.skills.length ? payload.skills.split(',').map(s=>s.trim()).filter(Boolean) : []),
    responseStyle: payload.responseStyle || '',
    roles: Array.isArray(payload.roles) ? payload.roles : (payload.roles ? [payload.roles] : []),
  }
}

module.exports = { normalizeAgent }
