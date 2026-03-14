const { requiresReview, createReviewRequest } = require('../services/policyService')
const { normalizeReviewItem } = require('../models/reviewModel')
const reviewStorage = require('../storage/reviewStorage')

/**
 * Middleware to check if an operation requires review
 * If review is required, creates a review item and blocks the operation
 * 
 * Usage:
 * router.post('/agents', checkReview({ itemType: 'agent', action: 'create' }), controller.create)
 */
function checkReview(options = {}) {
  return async (req, res, next) => {
    try {
      // Build context for policy evaluation
      const context = {
        itemType: options.itemType || 'agent',
        action: options.action || req.method.toLowerCase(),
        agent: req.body,
        itemData: req.body,
        itemId: req.params.id || null,
        user: req.user,
        ...options.context
      }
      
      // Evaluate policies
      const evaluation = requiresReview(context)
      
      // If no review required, proceed normally
      if (!evaluation.requiresReview) {
        return next()
      }
      
      // Review is required - create review item
      const reviewRequest = createReviewRequest(context, req.user.id)
      const normalized = normalizeReviewItem(reviewRequest)
      const reviewItem = await reviewStorage.create(normalized)
      
      // Block the operation and return review info
      return res.status(202).json({
        message: 'Operation requires human review',
        requiresReview: true,
        reviewItem: {
          id: reviewItem.id,
          status: reviewItem.status,
          priority: reviewItem.priority,
          reason: reviewItem.reason,
          submittedAt: reviewItem.submittedAt
        },
        policies: evaluation.rules,
        nextSteps: 'Your request has been submitted for review. You will be notified when a decision is made.'
      })
    } catch (error) {
      console.error('Error in checkReview middleware:', error)
      // In case of error, allow operation to proceed (fail open)
      // In production, you might want to fail closed instead
      return next()
    }
  }
}

/**
 * Middleware to verify that a review item has been approved
 * Used for operations that can only proceed after review approval
 * 
 * Usage:
 * router.post('/agents/:id/publish', requireApproval({ itemType: 'agent' }), controller.publish)
 */
function requireApproval(options = {}) {
  return async (req, res, next) => {
    try {
      const { itemId, itemType = 'agent' } = options
      const id = itemId || req.params.id
      
      if (!id) {
        return res.status(400).json({ 
          error: 'Item ID required for approval check' 
        })
      }
      
      // Check if there's an approved review for this item
      const reviews = await reviewStorage.getAll({
        itemId: id,
        itemType: itemType,
        status: 'approved'
      })
      
      if (reviews.length === 0) {
        return res.status(403).json({
          error: 'Operation not approved',
          message: 'This operation requires review approval. Please submit for review first.',
          requiresReview: true
        })
      }
      
      // Attach review info to request for logging
      req.approvedReview = reviews[0]
      
      return next()
    } catch (error) {
      console.error('Error in requireApproval middleware:', error)
      return res.status(500).json({ 
        error: 'Failed to verify approval status' 
      })
    }
  }
}

/**
 * Middleware to check if an item is blocked by pending review
 * 
 * Usage:
 * router.get('/agents/:id', checkReviewStatus({ itemType: 'agent' }), controller.getOne)
 */
function checkReviewStatus(options = {}) {
  return async (req, res, next) => {
    try {
      const { itemType = 'agent' } = options
      const itemId = req.params.id
      
      if (!itemId) {
        return next()
      }
      
      // Check for pending reviews
      const pendingReviews = await reviewStorage.getAll({
        itemId: itemId,
        itemType: itemType,
        status: 'pending'
      })
      
      // Check for revision requested reviews
      const revisionReviews = await reviewStorage.getAll({
        itemId: itemId,
        itemType: itemType,
        status: 'revision_requested'
      })
      
      // Attach review status to request
      req.reviewStatus = {
        hasPendingReview: pendingReviews.length > 0,
        hasRevisionRequested: revisionReviews.length > 0,
        pendingReviews,
        revisionReviews
      }
      
      return next()
    } catch (error) {
      console.error('Error in checkReviewStatus middleware:', error)
      // Continue even if review check fails
      return next()
    }
  }
}

/**
 * Middleware to enforce review bypass prevention
 * Ensures that operations marked as requiring review cannot bypass the review process
 * 
 * Usage:
 * router.post('/agents/:id/publish', preventReviewBypass({ action: 'marketplace_publish' }), controller.publish)
 */
function preventReviewBypass(options = {}) {
  return async (req, res, next) => {
    try {
      const context = {
        itemType: options.itemType || 'agent',
        action: options.action,
        agent: req.body,
        itemData: req.body,
        itemId: req.params.id,
        user: req.user,
        ...options.context
      }
      
      // Check if this action requires review
      const evaluation = requiresReview(context)
      
      if (!evaluation.requiresReview) {
        return next()
      }
      
      // Check if there's an approved review for this specific action
      const approvedReviews = await reviewStorage.getAll({
        itemId: context.itemId,
        itemType: context.itemType,
        status: 'approved'
      })
      
      // Filter for reviews matching this specific action
      const relevantReview = approvedReviews.find(review => {
        const metadata = review.metadata || {}
        return metadata.action === context.action
      })
      
      if (!relevantReview) {
        return res.status(403).json({
          error: 'Review required',
          message: 'This action requires review approval and cannot be bypassed',
          policies: evaluation.rules,
          requiresReview: true
        })
      }
      
      // Approved review exists, allow operation
      req.approvedReview = relevantReview
      return next()
      
    } catch (error) {
      console.error('Error in preventReviewBypass middleware:', error)
      return res.status(500).json({ 
        error: 'Failed to verify review requirement' 
      })
    }
  }
}

module.exports = {
  checkReview,
  requireApproval,
  checkReviewStatus,
  preventReviewBypass
}
