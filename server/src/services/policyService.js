const { REVIEW_TYPES, REVIEW_PRIORITY } = require('../models/reviewModel')

/**
 * Policy rules that determine when human review is required
 * Each rule has:
 * - id: unique identifier
 * - name: human-readable name
 * - description: what this policy checks
 * - check: function that returns true if review is required
 * - priority: review priority if triggered
 * - reason: explanation for why review is needed
 */
const POLICY_RULES = {
  // Agent policies
  EXTERNAL_API_INTEGRATION: {
    id: 'external_api_integration',
    name: 'External API Integration',
    description: 'Agents with external API access require review',
    check: (context) => {
      const { agent } = context
      if (!agent) return false
      // Check if agent has external integration capabilities
      const hasExternalIntegration = agent.skills?.some(skill => 
        skill.toLowerCase().includes('api') || 
        skill.toLowerCase().includes('integration') ||
        skill.toLowerCase().includes('external')
      )
      return hasExternalIntegration
    },
    priority: REVIEW_PRIORITY.HIGH,
    reason: 'Agent has external API integration capabilities that require security review'
  },

  HIGH_PRIVILEGE_AGENT: {
    id: 'high_privilege_agent',
    name: 'High Privilege Agent',
    description: 'Agents with admin or elevated roles require review',
    check: (context) => {
      const { agent } = context
      if (!agent) return false
      const hasAdminRole = agent.roles?.includes('admin')
      return hasAdminRole
    },
    priority: REVIEW_PRIORITY.CRITICAL,
    reason: 'Agent has administrative privileges that require approval'
  },

  SENSITIVE_SYSTEM_PROMPT: {
    id: 'sensitive_system_prompt',
    name: 'Sensitive System Prompt',
    description: 'System prompts with sensitive keywords require review',
    check: (context) => {
      const { agent } = context
      if (!agent || !agent.systemPrompt) return false
      
      const sensitiveKeywords = [
        'delete', 'remove', 'destroy', 'terminate',
        'password', 'secret', 'token', 'key',
        'admin', 'root', 'sudo', 'privilege',
        'bypass', 'override', 'disable security'
      ]
      
      const prompt = agent.systemPrompt.toLowerCase()
      return sensitiveKeywords.some(keyword => prompt.includes(keyword))
    },
    priority: REVIEW_PRIORITY.HIGH,
    reason: 'System prompt contains sensitive keywords that require review'
  },

  AUTONOMOUS_TASK_EXECUTION: {
    id: 'autonomous_task_execution',
    name: 'Autonomous Task Execution',
    description: 'Agents configured for autonomous execution require review',
    check: (context) => {
      const { agent } = context
      if (!agent) return false
      // Check if agent has autonomous execution capabilities
      const hasAutonomous = agent.skills?.some(skill => 
        skill.toLowerCase().includes('autonomous') || 
        skill.toLowerCase().includes('automated') ||
        skill.toLowerCase().includes('scheduled')
      )
      return hasAutonomous
    },
    priority: REVIEW_PRIORITY.HIGH,
    reason: 'Agent has autonomous execution capabilities that require approval'
  },

  MARKETPLACE_PUBLICATION: {
    id: 'marketplace_publication',
    name: 'Marketplace Publication',
    description: 'All marketplace publications require review',
    check: (context) => {
      const { action } = context
      return action === 'marketplace_publish'
    },
    priority: REVIEW_PRIORITY.MEDIUM,
    reason: 'Marketplace publication requires content review and approval'
  },

  BULK_OPERATIONS: {
    id: 'bulk_operations',
    name: 'Bulk Operations',
    description: 'Operations affecting multiple items require review',
    check: (context) => {
      const { operation } = context
      return operation?.type === 'bulk' && operation?.count > 10
    },
    priority: REVIEW_PRIORITY.MEDIUM,
    reason: 'Bulk operation affecting multiple items requires review'
  },

  GUARDRAIL_VIOLATION: {
    id: 'guardrail_violation',
    name: 'Guardrail Violation',
    description: 'Content flagged by guardrails requires review for override',
    check: (context) => {
      const { guardrailFlags } = context
      return guardrailFlags && guardrailFlags.length > 0
    },
    priority: REVIEW_PRIORITY.CRITICAL,
    reason: 'Content flagged by safety guardrails requires human review for override'
  },

  WORKFLOW_RESULT_THRESHOLD: {
    id: 'workflow_result_threshold',
    name: 'Workflow Result Threshold',
    description: 'Workflow results exceeding thresholds require review',
    check: (context) => {
      const { workflow } = context
      if (!workflow || !workflow.metrics) return false
      // Example: check if workflow processed high volume
      return workflow.metrics.itemsProcessed > 1000 || 
             workflow.metrics.cost > 100
    },
    priority: REVIEW_PRIORITY.MEDIUM,
    reason: 'Workflow results exceed configured thresholds and require review'
  }
}

/**
 * Evaluate policies for a given context and return triggered rules
 * @param {Object} context - Context to evaluate (agent, action, etc.)
 * @returns {Array} Array of triggered policy rules
 */
function evaluatePolicies(context = {}) {
  const triggeredRules = []
  
  for (const [key, rule] of Object.entries(POLICY_RULES)) {
    try {
      if (rule.check(context)) {
        triggeredRules.push({
          id: rule.id,
          name: rule.name,
          priority: rule.priority,
          reason: rule.reason
        })
      }
    } catch (error) {
      console.error(`Error evaluating policy ${rule.id}:`, error)
    }
  }
  
  return triggeredRules
}

/**
 * Check if an action requires review
 * @param {Object} context - Context to evaluate
 * @returns {Object} { requiresReview: boolean, rules: Array, priority: string, reason: string }
 */
function requiresReview(context = {}) {
  const triggeredRules = evaluatePolicies(context)
  
  if (triggeredRules.length === 0) {
    return {
      requiresReview: false,
      rules: [],
      priority: null,
      reason: null
    }
  }
  
  // Determine highest priority from triggered rules
  const priorityOrder = [
    REVIEW_PRIORITY.CRITICAL,
    REVIEW_PRIORITY.HIGH,
    REVIEW_PRIORITY.MEDIUM,
    REVIEW_PRIORITY.LOW
  ]
  
  let highestPriority = REVIEW_PRIORITY.LOW
  for (const priority of priorityOrder) {
    if (triggeredRules.some(rule => rule.priority === priority)) {
      highestPriority = priority
      break
    }
  }
  
  // Combine reasons
  const reasons = triggeredRules.map(rule => rule.reason).join('; ')
  
  return {
    requiresReview: true,
    rules: triggeredRules,
    priority: highestPriority,
    reason: reasons
  }
}

/**
 * Get review type based on context
 * @param {Object} context - Context to evaluate
 * @returns {string} Review type
 */
function getReviewType(context = {}) {
  const { action, itemType } = context
  
  if (action === 'marketplace_publish') {
    return REVIEW_TYPES.MARKETPLACE_PUBLICATION
  }
  
  if (action === 'external_integration') {
    return REVIEW_TYPES.EXTERNAL_INTEGRATION
  }
  
  if (context.guardrailFlags && context.guardrailFlags.length > 0) {
    return REVIEW_TYPES.GUARDRAIL_OVERRIDE
  }
  
  if (context.workflow) {
    return REVIEW_TYPES.WORKFLOW_RESULT
  }
  
  if (context.task && context.task.autonomous) {
    return REVIEW_TYPES.AUTONOMOUS_TASK_OUTPUT
  }
  
  // Default to agent operations
  if (itemType === 'agent') {
    if (action === 'create') return REVIEW_TYPES.AGENT_CREATION
    if (action === 'update') return REVIEW_TYPES.AGENT_UPDATE
    if (action === 'delete') return REVIEW_TYPES.AGENT_DELETION
  }
  
  return REVIEW_TYPES.AGENT_CREATION
}

/**
 * Create a review request from context
 * @param {Object} context - Context requiring review
 * @param {string} userId - ID of user submitting for review
 * @returns {Object} Review item data ready for storage
 */
function createReviewRequest(context, userId) {
  const evaluation = requiresReview(context)
  
  if (!evaluation.requiresReview) {
    throw new Error('Context does not require review')
  }
  
  const reviewType = getReviewType(context)
  const policyRules = evaluation.rules.map(r => r.id)
  
  return {
    type: reviewType,
    priority: evaluation.priority,
    itemType: context.itemType || 'agent',
    itemId: context.itemId || null,
    itemData: context.itemData || context.agent || null,
    submittedBy: userId,
    reason: evaluation.reason,
    policyRules,
    metadata: {
      action: context.action,
      originalContext: context
    }
  }
}

module.exports = {
  POLICY_RULES,
  evaluatePolicies,
  requiresReview,
  getReviewType,
  createReviewRequest
}
