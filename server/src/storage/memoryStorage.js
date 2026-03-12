const { genId } = require('../utils/id')

class MemoryStorage {
  constructor() {
    this.items = new Map()
  }

  async create(entity) {
    const id = entity.id || genId('ag_')
    const now = new Date().toISOString()
    const record = Object.assign({}, entity, { id, createdAt: now, updatedAt: now })
    this.items.set(id, record)
    return record
  }

  async getAll() {
    return Array.from(this.items.values())
  }

  async getById(id) {
    return this.items.get(id) || null
  }

  async update(id, patch) {
    const existing = this.items.get(id)
    if (!existing) return null
    const updated = Object.assign({}, existing, patch, { updatedAt: new Date().toISOString() })
    this.items.set(id, updated)
    return updated
  }

  async delete(id) {
    return this.items.delete(id)
  }
}

module.exports = new MemoryStorage()
