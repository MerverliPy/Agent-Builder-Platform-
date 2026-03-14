# Human-in-the-Loop Review System Documentation

## Overview

The Human-in-the-Loop Review System provides a comprehensive framework for requiring human approval before completing sensitive or policy-triggering operations in the Agent Builder Platform. This system ensures that high-risk actions, such as creating agents with external API access or administrative privileges, are reviewed and approved by authorized personnel before execution.

## Architecture

### Components

1. **Review Model** (`server/src/models/reviewModel.js`)
   - Defines review item structure and validation
   - Defines review status, types, and priorities
   - Provides helper functions for status transitions and validation

2. **Review Storage** (`server/src/storage/reviewStorage.js`)
   - In-memory storage for review items
   - Supports filtering, sorting, and statistics
   - Follows same interface as other storage adapters

3. **Policy Service** (`server/src/services/policyService.js`)
   - Defines policy rules that trigger reviews
   - Evaluates contexts against policies
   - Determines review requirements and priorities

4. **Review Middleware** (`server/src/middleware/reviewMiddleware.js`)
   - Intercepts operations that may require review
   - Creates review items when policies are triggered
   - Prevents bypass of review requirements

5. **Review Controller** (`server/src/controllers/reviewController.js`)
   - Handles review CRUD operations
   - Processes review decisions
   - Manages review statistics

6. **Review Routes** (`server/src/routes/reviews.js`)
   - Exposes review API endpoints
   - Enforces role-based access control

7. **Frontend Components**
   - `ReviewQueuePage.jsx`: Lists all review items with filtering
   - `ReviewDetailPage.jsx`: Shows detail and decision interface

## Review Queue Schema

### Review Item Structure

```javascript
{
  // Core fields
  id: string,                    // Unique identifier (rev_*)
  type: string,                  // Review type (see REVIEW_TYPES)
  status: string,                // Review status (see REVIEW_STATUS)
  priority: string,              // Priority level (see REVIEW_PRIORITY)
  
  // Item being reviewed
  itemType: string,              // Type of item (agent, workflow, task, etc.)
  itemId: string|null,           // ID of item (if exists)
  itemData: object|null,         // Snapshot of item data
  
  // Context
  submittedBy: string,           // User ID who submitted
  submittedAt: string,           // ISO timestamp of submission
  reason: string,                // Why review is required
  policyRules: string[],         // Policy rule IDs that triggered
  
  // Review decision
  reviewedBy: string|null,       // User ID who reviewed
  reviewedAt: string|null,       // ISO timestamp of review
  reviewNotes: string,           // Reviewer's notes
  revisionNotes: string,         // Specific revision instructions
  
  // Metadata
  metadata: object,              // Additional context-specific data
  createdAt: string,             // ISO timestamp of creation
  updatedAt: string              // ISO timestamp of last update
}
```

### Review Types

```javascript
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
```

### Review Status

```javascript
const REVIEW_STATUS = {
  PENDING: 'pending',                        // Awaiting review
  APPROVED: 'approved',                      // Approved by reviewer
  REJECTED: 'rejected',                      // Rejected by reviewer
  REVISION_REQUESTED: 'revision_requested'   // Changes requested
}
```

### Review Priority

```javascript
const REVIEW_PRIORITY = {
  LOW: 'low',           // Can wait
  MEDIUM: 'medium',     // Should be reviewed soon
  HIGH: 'high',         // Important, review quickly
  CRITICAL: 'critical'  // Urgent, review immediately
}
```

## Policy Rules

The system includes several built-in policy rules that automatically trigger reviews:

### 1. External API Integration
- **Triggers when**: Agent has external API integration capabilities
- **Priority**: HIGH
- **Detection**: Checks for "api", "integration", or "external" in skills

### 2. High Privilege Agent
- **Triggers when**: Agent has administrative privileges
- **Priority**: CRITICAL
- **Detection**: Checks for "admin" role

### 3. Sensitive System Prompt
- **Triggers when**: System prompt contains sensitive keywords
- **Priority**: HIGH
- **Keywords**: delete, remove, destroy, password, secret, admin, bypass, etc.

### 4. Autonomous Task Execution
- **Triggers when**: Agent is configured for autonomous execution
- **Priority**: HIGH
- **Detection**: Checks for "autonomous", "automated", or "scheduled" in skills

### 5. Marketplace Publication
- **Triggers when**: Item is being published to marketplace
- **Priority**: MEDIUM

### 6. Bulk Operations
- **Triggers when**: Operation affects >10 items
- **Priority**: MEDIUM

### 7. Guardrail Violation
- **Triggers when**: Content is flagged by safety guardrails
- **Priority**: CRITICAL

### 8. Workflow Result Threshold
- **Triggers when**: Workflow exceeds configured thresholds
- **Priority**: MEDIUM

## API Endpoints

### Review Management

#### List Reviews
```
GET /api/reviews
Query Parameters:
  - status: Filter by status
  - type: Filter by type
  - priority: Filter by priority
  - submittedBy: Filter by submitter
  - reviewedBy: Filter by reviewer
  - itemType: Filter by item type
  - itemId: Filter by item ID

Requires: admin or reviewer role
Returns: Array of review items
```

#### Get Review
```
GET /api/reviews/:id

Requires: admin or reviewer role
Returns: Single review item
```

#### Create Review
```
POST /api/reviews
Body: {
  type: string,
  itemType: string,
  itemData: object,
  reason: string,
  submittedBy: string,
  policyRules: string[]
}

Requires: Authentication
Returns: Created review item
```

#### Make Decision
```
POST /api/reviews/:id/decision
Body: {
  decision: 'approve' | 'reject' | 'request_revision',
  notes: string,
  revisionNotes: string  // Required if decision is 'request_revision'
}

Requires: admin or reviewer role
Returns: {
  review: Updated review item,
  decision: Decision metadata
}
```

#### Resubmit Review
```
POST /api/reviews/:id/resubmit
Body: {
  itemData: object,  // Updated item data
  notes: string      // Resubmission notes
}

Requires: Authentication
Returns: Updated review item with pending status
```

#### Get Statistics
```
GET /api/reviews/stats

Requires: admin or reviewer role
Returns: {
  total: number,
  pending: number,
  approved: number,
  rejected: number,
  revisionRequested: number,
  byType: object,
  byPriority: object
}
```

#### Delete Review
```
DELETE /api/reviews/:id

Requires: admin role
Returns: { success: true }
```

## Reviewer UI Flow

### 1. Access Review Queue
1. Navigate to `/reviews` in the application
2. Requires authentication and reviewer or admin role
3. View dashboard with statistics and review list

### 2. Filter Reviews
- Use status filter to show only pending reviews
- Use type filter to focus on specific review types
- Use priority filter to see high-priority items first

### 3. Review Item
1. Click on a review item in the queue
2. Navigate to review detail page
3. Examine:
   - Priority and status
   - Review type
   - Reason for review
   - Triggered policy rules
   - Item data (full details)
   - Submission timestamp
   - Submitter information

### 4. Make Decision
1. Click "Make Decision" button
2. Select decision type:
   - **Approve**: Item is acceptable, approve the operation
   - **Reject**: Item is not acceptable, deny the operation
   - **Request Revision**: Item needs changes before approval
3. Enter review notes explaining decision
4. If requesting revision, enter specific revision instructions
5. Submit decision

### 5. Track Results
- View updated status on detail page
- See decision reflected in queue
- System automatically notifies submitter (if notifications enabled)

## Policy Integration Points

### 1. Route-Level Integration

Add review middleware to routes:

```javascript
const { checkReview } = require('../middleware/reviewMiddleware')

// Example: Check review for agent creation
router.post('/agents', 
  validateCreateAgent,
  requireAuth,
  requireRole('admin', 'editor'),
  checkReview({ itemType: 'agent', action: 'create' }),
  controller.create
)
```

### 2. Controller-Level Integration

Manually trigger review in controllers:

```javascript
const { requiresReview, createReviewRequest } = require('../services/policyService')
const { normalizeReviewItem } = require('../models/reviewModel')
const reviewStorage = require('../storage/reviewStorage')

async function publishToMarketplace(req, res) {
  const context = {
    action: 'marketplace_publish',
    itemType: 'agent',
    itemId: req.params.id,
    itemData: req.body,
    user: req.user
  }
  
  const evaluation = requiresReview(context)
  
  if (evaluation.requiresReview) {
    // Create review and block operation
    const reviewRequest = createReviewRequest(context, req.user.id)
    const normalized = normalizeReviewItem(reviewRequest)
    const reviewItem = await reviewStorage.create(normalized)
    
    return res.status(202).json({
      message: 'Operation requires review',
      reviewItem
    })
  }
  
  // Proceed with operation
  // ...
}
```

### 3. Service-Level Integration

Use policy service for complex checks:

```javascript
const { requiresReview } = require('../services/policyService')

async function processWorkflow(workflowData) {
  const context = {
    workflow: workflowData,
    action: 'workflow_execution'
  }
  
  const evaluation = requiresReview(context)
  
  if (evaluation.requiresReview) {
    // Pause workflow and create review
    await pauseWorkflow(workflowData.id)
    await createReviewForWorkflow(workflowData, evaluation)
    return { status: 'paused', reason: 'review_required' }
  }
  
  // Continue workflow
  return await executeWorkflow(workflowData)
}
```

### 4. Approval Requirement

Require approval before allowing operations:

```javascript
const { requireApproval } = require('../middleware/reviewMiddleware')

// Example: Require approval before publishing
router.post('/agents/:id/publish',
  requireAuth,
  requireApproval({ itemType: 'agent' }),
  controller.publish
)
```

### 5. Bypass Prevention

Prevent bypass of review requirements:

```javascript
const { preventReviewBypass } = require('../middleware/reviewMiddleware')

// Example: Enforce review for external integrations
router.post('/agents/:id/enable-integration',
  requireAuth,
  preventReviewBypass({ action: 'external_integration' }),
  controller.enableIntegration
)
```

## Status Transitions

### Valid Transitions

```
pending → approved
pending → rejected
pending → revision_requested

revision_requested → pending (via resubmit)
revision_requested → approved
revision_requested → rejected

approved → (final, no transitions)
rejected → (final, no transitions)
```

### Transition Rules

1. **Pending** reviews can transition to any other status via decision
2. **Revision Requested** reviews can be resubmitted (→ pending) or decided (→ approved/rejected)
3. **Approved** and **Rejected** are final states and cannot transition

## Audit Trail

The system maintains a complete audit trail:

1. **Submission**: Records who, when, and why
2. **Policy Triggers**: Records which policies were violated
3. **Item Snapshot**: Preserves exact state of item at review time
4. **Decision**: Records reviewer, timestamp, and notes
5. **Resubmission**: Records resubmission timestamp and changes
6. **Updates**: All changes timestamped via `updatedAt`

Access audit data via:
- Review item fields (submittedBy, submittedAt, reviewedBy, reviewedAt)
- Metadata field for additional tracking
- Item data field for original state preservation

## Adding New Policy Rules

1. Define policy in `policyService.js`:

```javascript
MY_CUSTOM_POLICY: {
  id: 'my_custom_policy',
  name: 'My Custom Policy',
  description: 'Description of what this checks',
  check: (context) => {
    // Return true if review is required
    return context.someField === 'trigger_value'
  },
  priority: REVIEW_PRIORITY.HIGH,
  reason: 'Explanation shown to reviewers'
}
```

2. Add policy to `POLICY_RULES` object
3. Test policy with various contexts
4. Document policy in this file

## Security Considerations

### Bypass Prevention
- Review middleware checks policies **before** executing operations
- Approved review IDs can be verified before proceeding
- Final status reviews cannot be modified
- All review operations require authentication
- Reviewer role required for making decisions

### Role-Based Access
- **Admin**: Full access (view, decide, delete)
- **Reviewer**: Can view and decide on reviews
- **Editor**: Can submit for review, cannot view queue
- **User**: Can submit for review, cannot view queue

### Data Protection
- Review items preserve snapshot of original data
- Item data cannot be modified after approval/rejection
- Audit trail is immutable (via createdAt, updatedAt)
- Reviewer identity is recorded permanently

## Best Practices

1. **Review Promptly**: Pending reviews block operations
2. **Be Specific**: Provide detailed notes explaining decisions
3. **Request Revision**: Use instead of reject when changes can fix issues
4. **Document Policies**: Keep policy documentation up-to-date
5. **Monitor Queue**: Check for pending reviews regularly
6. **Track Metrics**: Use statistics to identify trends
7. **Train Reviewers**: Ensure reviewers understand policies
8. **Test Thoroughly**: Test review flow for each policy

## Troubleshooting

### Review Not Created
- Check if policies are configured correctly
- Verify middleware is added to route
- Check console for policy evaluation errors
- Ensure context has required fields

### Cannot Make Decision
- Verify user has reviewer or admin role
- Check review status allows transition
- Ensure all required fields are provided
- Check for validation errors in response

### Review Bypass
- Verify middleware is **before** controller in route
- Check that preventReviewBypass is used for critical operations
- Ensure requireApproval is used where needed
- Audit logs for unauthorized operations

### Performance Issues
- Monitor review count (consider archiving old reviews)
- Check filter queries are optimized
- Consider pagination for large queues
- Profile policy evaluation for expensive checks

## Future Enhancements

1. **Notifications**: Email/SMS when review is pending or decided
2. **Escalation**: Auto-escalate reviews pending >24 hours
3. **Delegation**: Allow reviewers to delegate to others
4. **Batch Review**: Approve/reject multiple items at once
5. **Review History**: Track all decisions by reviewer
6. **Custom Workflows**: Multi-step approval chains
7. **SLA Tracking**: Monitor review response times
8. **Comments**: Allow discussion on review items
9. **Attachments**: Support file attachments in reviews
10. **Webhooks**: Trigger external systems on decisions

## Example Usage

See `server/src/tests/reviews.test.js` for comprehensive examples of:
- Creating review items
- Making decisions
- Filtering reviews
- Handling resubmissions
- Testing policy triggers

## Support

For issues or questions:
1. Check this documentation
2. Review test cases in `/server/src/tests/reviews.test.js`
3. Check policy definitions in `/server/src/services/policyService.js`
4. Review QA checklist in `/REVIEW_SYSTEM_QA_CHECKLIST.md`
