const { genId } = require('../utils/id')
const { REVIEW_STATUS } = require('../models/reviewModel')

/**
 * In-memory storage for review items
 * Follows the same storage interface as agents and users
 */
class ReviewStorage {
  constructor() {
    this.items = new Map()
  }

  /**
   * Create a new review item
   */
  async create(entity) {
    const id = entity.id || genId('rev_')
    const now = new Date().toISOString()
    const record = Object.assign({}, entity, { 
      id, 
      createdAt: entity.createdAt || now, 
      updatedAt: now 
    })
    this.items.set(id, record)
    return record
  }

  /**
   * Get all review items
   * @param {Object} filters - Optional filters
   * @returns {Array} Filtered review items
   */
  async getAll(filters = {}) {
    let items = Array.from(this.items.values())
    
    // Filter by status
    if (filters.status) {
      items = items.filter(item => item.status === filters.status)
    }
    
    // Filter by type
    if (filters.type) {
      items = items.filter(item => item.type === filters.type)
    }
    
    // Filter by priority
    if (filters.priority) {
      items = items.filter(item => item.priority === filters.priority)
    }
    
    // Filter by submitter
    if (filters.submittedBy) {
      items = items.filter(item => item.submittedBy === filters.submittedBy)
    }
    
    // Filter by reviewer
    if (filters.reviewedBy) {
      items = items.filter(item => item.reviewedBy === filters.reviewedBy)
    }
    
    // Filter by item type
    if (filters.itemType) {
      items = items.filter(item => item.itemType === filters.itemType)
    }
    
    // Filter by item ID
    if (filters.itemId) {
      items = items.filter(item => item.itemId === filters.itemId)
    }
    
    // Sort by created date (newest first) by default
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    return items
  }

  /**
   * Get a single review item by ID
   */
  async getById(id) {
    return this.items.get(id) || null
  }

  /**
   * Update a review item
   */
  async update(id, patch) {
    const existing = this.items.get(id)
    if (!existing) return null
    
    const updated = Object.assign({}, existing, patch, { 
      updatedAt: new Date().toISOString() 
    })
    this.items.set(id, updated)
    return updated
  }

  /**
   * Delete a review item
   */
  async delete(id) {
    return this.items.delete(id)
  }

  /**
   * Get pending review items count
   */
  async getPendingCount() {
    const pending = await this.getAll({ status: REVIEW_STATUS.PENDING })
    return pending.length
  }

  /**
   * Get review statistics
   */
  async getStats() {
    const all = await this.getAll()
    
    const stats = {
      total: all.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      revisionRequested: 0,
      byType: {},
      byPriority: {}
    }
    
    all.forEach(item => {
      // Count by status
      if (item.status === REVIEW_STATUS.PENDING) stats.pending++
      else if (item.status === REVIEW_STATUS.APPROVED) stats.approved++
      else if (item.status === REVIEW_STATUS.REJECTED) stats.rejected++
      else if (item.status === REVIEW_STATUS.REVISION_REQUESTED) stats.revisionRequested++
      
      // Count by type
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1
      
      // Count by priority
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1
    })
    
    return stats
  }

  /**
   * Clear all review items (for testing)
   */
  async clear() {
    this.items.clear()
  }
}

module.exports = new ReviewStorage()
