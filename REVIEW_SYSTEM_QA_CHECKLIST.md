# Human-in-the-Loop Review System - QA Checklist

## Test Environment Setup

- [ ] Server is running with review routes enabled
- [ ] Client is running and can access /reviews route
- [ ] Test users created with appropriate roles:
  - [ ] Admin user (has 'admin' role)
  - [ ] Reviewer user (has 'reviewer' role)
  - [ ] Editor user (has 'editor' role)
  - [ ] Regular user (no special roles)

## Backend API Testing

### Review Creation (POST /api/reviews)
- [ ] ✅ Can create a review item with valid data
- [ ] ✅ Review item gets assigned unique ID
- [ ] ✅ Status defaults to 'pending'
- [ ] ✅ Rejects creation with missing required fields (itemType, reason, submittedBy)
- [ ] ✅ Requires authentication
- [ ] ✅ Stores policy rules that triggered review
- [ ] ✅ Stores item data snapshot

### Review Listing (GET /api/reviews)
- [ ] ✅ Returns all reviews for admin/reviewer users
- [ ] ✅ Can filter by status (pending, approved, rejected, revision_requested)
- [ ] ✅ Can filter by type (agent_creation, agent_update, etc.)
- [ ] ✅ Can filter by priority (critical, high, medium, low)
- [ ] ✅ Can filter by submittedBy user
- [ ] ✅ Can filter by itemType
- [ ] ✅ Can filter by itemId
- [ ] ✅ Returns reviews sorted by creation date (newest first)
- [ ] ✅ Requires reviewer or admin role
- [ ] ✅ Returns 403 for users without reviewer role

### Review Detail (GET /api/reviews/:id)
- [ ] ✅ Returns single review by ID
- [ ] ✅ Returns 404 for non-existent review
- [ ] ✅ Requires reviewer or admin role
- [ ] ✅ Includes all review fields (itemData, policies, notes, etc.)

### Review Decision (POST /api/reviews/:id/decision)
- [ ] ✅ Can approve a pending review
- [ ] ✅ Can reject a pending review
- [ ] ✅ Can request revision on a pending review
- [ ] ✅ Records reviewer ID and timestamp
- [ ] ✅ Stores review notes
- [ ] ✅ Stores revision notes when requesting revision
- [ ] ✅ Rejects invalid decision types
- [ ] ✅ Prevents transition from approved/rejected back to pending
- [ ] ✅ Allows revision_requested to transition to any status
- [ ] ✅ Requires reviewer or admin role
- [ ] ✅ Returns updated review with decision metadata

### Review Resubmission (POST /api/reviews/:id/resubmit)
- [ ] ✅ Can resubmit review with revision_requested status
- [ ] ✅ Updates item data with new version
- [ ] ✅ Resets status to pending
- [ ] ✅ Clears previous review decision
- [ ] ✅ Records resubmission timestamp and notes
- [ ] ✅ Rejects resubmission if not in revision_requested status
- [ ] ✅ Requires authentication

### Review Statistics (GET /api/reviews/stats)
- [ ] ✅ Returns total count
- [ ] ✅ Returns count by status (pending, approved, rejected, revision_requested)
- [ ] ✅ Returns count by type
- [ ] ✅ Returns count by priority
- [ ] ✅ Requires reviewer or admin role

### Review Deletion (DELETE /api/reviews/:id)
- [ ] ✅ Can delete review (admin only)
- [ ] ✅ Returns 404 for non-existent review
- [ ] ✅ Requires admin role
- [ ] ✅ Returns 403 for non-admin users

## Policy Service Testing

### Policy Evaluation
- [ ] ✅ External API Integration policy triggers for agents with API skills
- [ ] ✅ High Privilege Agent policy triggers for agents with admin role
- [ ] ✅ Sensitive System Prompt policy triggers for prompts with sensitive keywords
- [ ] ✅ Autonomous Task Execution policy triggers for agents with autonomous skills
- [ ] ✅ Marketplace Publication policy triggers for marketplace_publish action
- [ ] ✅ Bulk Operations policy triggers for operations affecting >10 items
- [ ] ✅ Guardrail Violation policy triggers when guardrail flags present
- [ ] ✅ Workflow Result Threshold policy triggers for high-volume workflows
- [ ] ✅ Returns highest priority from multiple triggered policies
- [ ] ✅ Returns combined reasons from all triggered policies

### Review Middleware
- [ ] Agent creation with external API skill triggers review (returns 202)
- [ ] Agent creation with admin role triggers review (returns 202)
- [ ] Agent with sensitive system prompt triggers review (returns 202)
- [ ] Agent without policy violations proceeds normally (returns 201)
- [ ] Review item is created in storage when policy triggered
- [ ] Review response includes review ID, status, priority, and reason
- [ ] Review response includes triggered policy rules
- [ ] Middleware fails open (allows operation) if policy check errors

## Frontend UI Testing

### Review Queue Page (/reviews)
- [ ] Page loads without errors
- [ ] Page requires authentication (redirects to login if not logged in)
- [ ] Displays statistics cards (Total, Pending, Approved, Rejected)
- [ ] Statistics show correct counts
- [ ] Displays list of review items
- [ ] Each review item shows:
  - [ ] Priority badge with correct color
  - [ ] Status badge with correct color
  - [ ] Review type
  - [ ] Item name (if available)
  - [ ] Reason for review
  - [ ] Submission timestamp
  - [ ] Review timestamp (if reviewed)
- [ ] Status filter works (all, pending, approved, rejected, revision_requested)
- [ ] Type filter works (agent_creation, agent_update, etc.)
- [ ] Clicking review item navigates to detail page
- [ ] Shows "No reviews found" when queue is empty
- [ ] Shows loading state while fetching
- [ ] Shows error message if fetch fails
- [ ] Reviews are sorted by newest first
- [ ] No console errors

### Review Detail Page (/reviews/:id)
- [ ] Page loads without errors
- [ ] Page requires authentication
- [ ] Shows priority badge with correct color
- [ ] Shows status badge with correct color
- [ ] Shows review type
- [ ] Shows item name
- [ ] Shows reason for review in formatted box
- [ ] Shows triggered policy rules as badges
- [ ] Shows item data in formatted JSON
- [ ] Shows submission timestamp
- [ ] Shows review timestamp (if reviewed)
- [ ] Shows review notes (if reviewed)
- [ ] Shows revision notes (if revision requested)
- [ ] "Back to Queue" button works
- [ ] Shows "Make Decision" button for pending/revision_requested reviews
- [ ] Hides "Make Decision" button for approved/rejected reviews
- [ ] No console errors

### Review Decision Form
- [ ] Form appears when "Make Decision" clicked
- [ ] Decision dropdown has options: approve, reject, request_revision
- [ ] Review notes textarea is present
- [ ] Revision notes textarea appears only when "request_revision" selected
- [ ] Revision notes textarea hides when other decision selected
- [ ] "Submit Decision" button is enabled
- [ ] "Cancel" button closes form
- [ ] Form shows loading state while submitting
- [ ] Form disables inputs while submitting
- [ ] Shows success message after submission
- [ ] Redirects to queue after successful submission
- [ ] Shows error message if submission fails
- [ ] Decision is reflected in review detail after submission
- [ ] No console errors during submission

### Navigation
- [ ] "Reviews" link appears in main navigation
- [ ] "Reviews" link highlights when on review pages
- [ ] Clicking "Reviews" link navigates to queue page
- [ ] Navigation works on mobile menu
- [ ] No console errors

## Integration Testing

### Agent Creation Flow with Review
- [ ] Create agent with external API skill (e.g., skills: ["api", "integration"])
- [ ] Verify creation returns 202 (requires review)
- [ ] Verify response includes review item data
- [ ] Navigate to review queue
- [ ] Verify review appears in queue with "pending" status
- [ ] Open review detail
- [ ] Verify agent data is shown correctly
- [ ] Approve the review
- [ ] Verify status changes to "approved"
- [ ] Verify agent is created successfully (or complete creation manually)

### Agent Creation Flow with Revision
- [ ] Create agent triggering review (e.g., admin role)
- [ ] Verify review is created
- [ ] Request revision with specific notes
- [ ] Verify status changes to "revision_requested"
- [ ] Verify revision notes are displayed
- [ ] Resubmit with updated data (via API or manual update)
- [ ] Verify status returns to "pending"
- [ ] Verify resubmission metadata is stored
- [ ] Approve or reject the resubmitted review

### Agent Creation Flow with Rejection
- [ ] Create agent triggering review
- [ ] Reject the review with notes
- [ ] Verify status changes to "rejected"
- [ ] Verify rejection notes are displayed
- [ ] Verify agent is NOT created

## Permission Testing

### Admin User
- [ ] Can view review queue
- [ ] Can view review details
- [ ] Can make decisions (approve/reject/request revision)
- [ ] Can delete reviews
- [ ] Can access /api/reviews/stats

### Reviewer User
- [ ] Can view review queue
- [ ] Can view review details
- [ ] Can make decisions (approve/reject/request revision)
- [ ] Cannot delete reviews (403)
- [ ] Can access /api/reviews/stats

### Editor User
- [ ] Can submit items for review
- [ ] Can resubmit after revision requested
- [ ] Cannot view review queue (403)
- [ ] Cannot make review decisions (403)
- [ ] Cannot access /api/reviews/stats (403)

### Regular User
- [ ] Can submit items for review
- [ ] Cannot view review queue (403)
- [ ] Cannot make review decisions (403)
- [ ] Cannot access /api/reviews/stats (403)

## Audit Trail Testing

### Decision Audit
- [ ] Review records who submitted (submittedBy field)
- [ ] Review records submission timestamp (submittedAt field)
- [ ] Review records who reviewed (reviewedBy field)
- [ ] Review records review timestamp (reviewedAt field)
- [ ] Review records review notes
- [ ] Review records revision notes
- [ ] Review preserves original item data
- [ ] Resubmission records timestamp in metadata
- [ ] Resubmission records notes in metadata

### Data Preservation
- [ ] Item data is snapshot at review creation time
- [ ] Updating source item doesn't affect review item data
- [ ] Policy rules are preserved even if policies change
- [ ] Metadata preserves original context
- [ ] All status transitions are timestamped via updatedAt

## Error Handling

### Backend Errors
- [ ] Invalid decision type returns 400 with error message
- [ ] Invalid status transition returns 400 with error message
- [ ] Missing required fields returns 400 with validation errors
- [ ] Non-existent review ID returns 404
- [ ] Unauthorized access returns 401
- [ ] Forbidden access returns 403
- [ ] Server errors return 500 with error message

### Frontend Errors
- [ ] Shows error message when API call fails
- [ ] Shows error message when review not found
- [ ] Shows error message when decision submission fails
- [ ] Handles network errors gracefully
- [ ] Handles authentication errors gracefully
- [ ] No unhandled promise rejections in console
- [ ] No React errors in console

## Security Testing

### Bypass Prevention
- [ ] Cannot approve own submission without reviewer role
- [ ] Cannot bypass review by calling create endpoint directly
- [ ] Cannot modify approved/rejected reviews
- [ ] Cannot delete reviews without admin role
- [ ] Cannot view reviews without reviewer role
- [ ] Review middleware catches policy violations before creation
- [ ] Sensitive operations remain blocked until reviewed

### Data Validation
- [ ] All user inputs are validated
- [ ] XSS prevention in review notes
- [ ] XSS prevention in item data display
- [ ] SQL injection prevention (N/A for in-memory storage)
- [ ] Validates reviewer has appropriate role
- [ ] Validates decision types
- [ ] Validates status transitions

## Performance Testing

- [ ] Review queue loads quickly (<2s for 100 reviews)
- [ ] Review detail loads quickly (<500ms)
- [ ] Decision submission completes quickly (<1s)
- [ ] Filtering is responsive (<500ms)
- [ ] Statistics calculation is fast (<500ms for 1000 reviews)
- [ ] No memory leaks when creating many reviews
- [ ] No N+1 query issues (when moving to database)

## Browser Compatibility

- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] Mobile Safari: All features work
- [ ] Mobile Chrome: All features work

## Accessibility Testing

- [ ] Keyboard navigation works throughout review queue
- [ ] Keyboard navigation works in review detail
- [ ] Keyboard navigation works in decision form
- [ ] Screen reader announces review status
- [ ] Screen reader announces priority
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] All interactive elements are keyboard accessible

## Final Checks

- [ ] No console errors on any page
- [ ] No console warnings on any page
- [ ] No React warnings in development
- [ ] All links work correctly
- [ ] All buttons work correctly
- [ ] All forms validate correctly
- [ ] All error messages are user-friendly
- [ ] All success messages are clear
- [ ] Documentation is complete
- [ ] Code is properly commented
- [ ] Tests pass successfully
