const { genId } = require('../utils/id')

/**
 * Review item types that can be submitted for human review
 */
const REVIEW_TYPES = {
  MARKETPLACE_PUBLICATION: 'marketplace_publication',
  EXTERNAL_INTEGRATION: 'external_integration',
  AUTONOMOUS_TASK_OUTPUT: 'autonomous_task_output',
  WORKFLOW_RESULT: 'workflow_result',
  GUARDRAIL_OVERRIDE: 'guardrail_override',
  AGENT_CREATION: 'agent_creation',
  AGENT_UPDATE: 'agent_update',
  AGENT_DELETION: 'agent_deletion'
}

/**
 * Review status states
 */
const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVISION_REQUESTED: 'revision_requested'
}

/**
 * Priority levels for review items
 */
const REVIEW_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * Normalize a review item to ensure consistent structure
 * @param {Object} payload - Raw review item data
 * @returns {Object} Normalized review item
 */
function normalizeReviewItem(payload = {}) {
  const now = new Date().toISOString()
  
  return {
    // Core fields
    id: payload.id || genId('rev_'),
    type: payload.type || REVIEW_TYPES.AGENT_CREATION,
    status: payload.status || REVIEW_STATUS.PENDING,
    priority: payload.priority || REVIEW_PRIORITY.MEDIUM,
    
    // Item being reviewed
    itemType: payload.itemType || 'agent', // agent, workflow, task, etc.
    itemId: payload.itemId || null,
    itemData: payload.itemData || null, // snapshot of the item being reviewed
    
    // Context
    submittedBy: payload.submittedBy || null, // user id who submitted
    submittedAt: payload.submittedAt || now,
    reason: payload.reason || '', // why review is required
    policyRules: Array.isArray(payload.policyRules) 
      ? payload.policyRules 
      : (payload.policyRules ? [payload.policyRules] : []), // which policies triggered review
    
    // Review decision
    reviewedBy: payload.reviewedBy || null, // user id who reviewed
    reviewedAt: payload.reviewedAt || null,
    reviewNotes: payload.reviewNotes || '',
    revisionNotes: payload.revisionNotes || '', // specific notes if revision requested
    
    // Metadata
    metadata: payload.metadata || {}, // additional context-specific data
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now
  }
}

/**
 * Validate a review item has required fields
 * @param {Object} item - Review item to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateReviewItem(item) {
  const errors = []
  
  if (!item.type || !Object.values(REVIEW_TYPES).includes(item.type)) {
    errors.push('Invalid or missing review type')
  }
  
  if (!item.itemType || typeof item.itemType !== 'string') {
    errors.push('Invalid or missing item type')
  }
  
  if (!item.reason || typeof item.reason !== 'string' || item.reason.trim().length === 0) {
    errors.push('Review reason is required')
  }
  
  if (!item.submittedBy) {
    errors.push('Submitter user ID is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Check if a review item can be transitioned to a new status
 * @param {string} currentStatus - Current review status
 * @param {string} newStatus - Desired new status
 * @returns {boolean} Whether transition is allowed
 */
function canTransitionStatus(currentStatus, newStatus) {
  // Pending can go to any other status
  if (currentStatus === REVIEW_STATUS.PENDING) {
    return [
      REVIEW_STATUS.APPROVED,
      REVIEW_STATUS.REJECTED,
      REVIEW_STATUS.REVISION_REQUESTED
    ].includes(newStatus)
  }
  
  // Revision requested can go back to pending or be approved/rejected
  if (currentStatus === REVIEW_STATUS.REVISION_REQUESTED) {
    return [
      REVIEW_STATUS.PENDING,
      REVIEW_STATUS.APPROVED,
      REVIEW_STATUS.REJECTED
    ].includes(newStatus)
  }
  
  // Final states (approved/rejected) cannot be changed
  return false
}

/**
 * Create a review decision object
 * @param {string} reviewerId - ID of user making decision
 * @param {string} decision - Decision: 'approve', 'reject', 'request_revision'
 * @param {string} notes - Review notes
 * @param {string} revisionNotes - Specific revision notes if applicable
 * @returns {Object} Review decision data
 */
function createReviewDecision(reviewerId, decision, notes = '', revisionNotes = '') {
  const statusMap = {
    approve: REVIEW_STATUS.APPROVED,
    reject: REVIEW_STATUS.REJECTED,
    request_revision: REVIEW_STATUS.REVISION_REQUESTED
  }
  
  return {
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
    status: statusMap[decision] || REVIEW_STATUS.PENDING,
    reviewNotes: notes,
    revisionNotes: decision === 'request_revision' ? revisionNotes : ''
  }
}

module.exports = {
  normalizeReviewItem,
  validateReviewItem,
  canTransitionStatus,
  createReviewDecision,
  REVIEW_TYPES,
  REVIEW_STATUS,
  REVIEW_PRIORITY
}
