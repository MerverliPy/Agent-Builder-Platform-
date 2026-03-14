const reviewStorage = require('../storage/reviewStorage')
const { 
  normalizeReviewItem, 
  validateReviewItem,
  canTransitionStatus,
  createReviewDecision,
  REVIEW_STATUS 
} = require('../models/reviewModel')

/**
 * Get all review items with optional filters
 * GET /api/reviews?status=pending&type=agent_creation&priority=high
 */
async function getAll(req, res) {
  try {
    const filters = {}
    
    // Extract query parameters
    if (req.query.status) filters.status = req.query.status
    if (req.query.type) filters.type = req.query.type
    if (req.query.priority) filters.priority = req.query.priority
    if (req.query.submittedBy) filters.submittedBy = req.query.submittedBy
    if (req.query.reviewedBy) filters.reviewedBy = req.query.reviewedBy
    if (req.query.itemType) filters.itemType = req.query.itemType
    if (req.query.itemId) filters.itemId = req.query.itemId
    
    const items = await reviewStorage.getAll(filters)
    return res.json(items)
  } catch (error) {
    console.error('Error fetching review items:', error)
    return res.status(500).json({ error: 'Failed to fetch review items' })
  }
}

/**
 * Get a single review item by ID
 * GET /api/reviews/:id
 */
async function getOne(req, res) {
  try {
    const item = await reviewStorage.getById(req.params.id)
    if (!item) {
      return res.status(404).json({ error: 'Review item not found' })
    }
    return res.json(item)
  } catch (error) {
    console.error('Error fetching review item:', error)
    return res.status(500).json({ error: 'Failed to fetch review item' })
  }
}

/**
 * Create a new review item
 * POST /api/reviews
 */
async function create(req, res) {
  try {
    // Normalize and validate
    const normalized = normalizeReviewItem(req.body)
    const validation = validateReviewItem(normalized)
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid review item', 
        details: validation.errors 
      })
    }
    
    // Create review item
    const created = await reviewStorage.create(normalized)
    return res.status(201).json(created)
  } catch (error) {
    console.error('Error creating review item:', error)
    return res.status(500).json({ error: 'Failed to create review item' })
  }
}

/**
 * Update a review item (for resubmission after revision)
 * PUT /api/reviews/:id
 */
async function update(req, res) {
  try {
    const existing = await reviewStorage.getById(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'Review item not found' })
    }
    
    // Only allow updates to certain fields
    const allowedUpdates = {
      itemData: req.body.itemData,
      reason: req.body.reason,
      metadata: req.body.metadata
    }
    
    // Remove undefined fields
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key]
      }
    })
    
    const updated = await reviewStorage.update(req.params.id, allowedUpdates)
    return res.json(updated)
  } catch (error) {
    console.error('Error updating review item:', error)
    return res.status(500).json({ error: 'Failed to update review item' })
  }
}

/**
 * Make a review decision (approve/reject/request revision)
 * POST /api/reviews/:id/decision
 * Body: { decision: 'approve'|'reject'|'request_revision', notes: '', revisionNotes: '' }
 */
async function makeDecision(req, res) {
  try {
    const { decision, notes = '', revisionNotes = '' } = req.body
    
    // Validate decision
    const validDecisions = ['approve', 'reject', 'request_revision']
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ 
        error: 'Invalid decision', 
        details: `Decision must be one of: ${validDecisions.join(', ')}` 
      })
    }
    
    // Get existing review item
    const existing = await reviewStorage.getById(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'Review item not found' })
    }
    
    // Create decision object
    const decisionData = createReviewDecision(
      req.user.sub, 
      decision, 
      notes, 
      revisionNotes
    )
    
    // Check if status transition is allowed
    if (!canTransitionStatus(existing.status, decisionData.status)) {
      return res.status(400).json({ 
        error: 'Invalid status transition',
        details: `Cannot transition from ${existing.status} to ${decisionData.status}`
      })
    }
    
    // Update review item
    const updated = await reviewStorage.update(req.params.id, decisionData)
    
    return res.json({
      review: updated,
      decision: {
        made: decision,
        by: req.user.username,
        at: decisionData.reviewedAt
      }
    })
  } catch (error) {
    console.error('Error making review decision:', error)
    return res.status(500).json({ error: 'Failed to make review decision' })
  }
}

/**
 * Resubmit a review item after addressing revision requests
 * POST /api/reviews/:id/resubmit
 * Body: { itemData: {}, notes: '' }
 */
async function resubmit(req, res) {
  try {
    const existing = await reviewStorage.getById(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'Review item not found' })
    }
    
    // Only allow resubmission if in revision_requested state
    if (existing.status !== REVIEW_STATUS.REVISION_REQUESTED) {
      return res.status(400).json({ 
        error: 'Invalid resubmission',
        details: 'Can only resubmit items in revision_requested status'
      })
    }
    
    // Update item data and reset to pending
    const updates = {
      status: REVIEW_STATUS.PENDING,
      itemData: req.body.itemData || existing.itemData,
      metadata: {
        ...existing.metadata,
        resubmittedAt: new Date().toISOString(),
        resubmissionNotes: req.body.notes || ''
      },
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: '',
      revisionNotes: ''
    }
    
    const updated = await reviewStorage.update(req.params.id, updates)
    return res.json(updated)
  } catch (error) {
    console.error('Error resubmitting review item:', error)
    return res.status(500).json({ error: 'Failed to resubmit review item' })
  }
}

/**
 * Get review queue statistics
 * GET /api/reviews/stats
 */
async function getStats(req, res) {
  try {
    const stats = await reviewStorage.getStats()
    return res.json(stats)
  } catch (error) {
    console.error('Error fetching review stats:', error)
    return res.status(500).json({ error: 'Failed to fetch review stats' })
  }
}

/**
 * Delete a review item (admin only)
 * DELETE /api/reviews/:id
 */
async function remove(req, res) {
  try {
    const deleted = await reviewStorage.delete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ error: 'Review item not found' })
    }
    return res.json({ success: true })
  } catch (error) {
    console.error('Error deleting review item:', error)
    return res.status(500).json({ error: 'Failed to delete review item' })
  }
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  makeDecision,
  resubmit,
  getStats,
  remove
}
