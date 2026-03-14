#!/bin/bash

# Comprehensive Review Workflow Test

BASE_URL="http://localhost:5000"

echo "======================================"
echo "  Review System Workflow Test"
echo "======================================"
echo ""

# 1. Register and login as admin
echo "1. Setting up admin user..."
ADMIN_REG=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"workflow_admin","password":"admin123"}')

# Set reviewer role
curl -s -X POST "$BASE_URL/api/test/set-roles" \
  -H "Content-Type: application/json" \
  -d '{"username":"workflow_admin","roles":["admin","reviewer"]}' > /dev/null
  
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"workflow_admin","password":"admin123"}')
ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "   ✓ Admin user created with reviewer role"
echo ""

# 2. Create an agent that triggers review (high privilege)
echo "2. Creating agent with high privileges..."
AGENT_CREATE=$(curl -s -X POST "$BASE_URL/api/agents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Privileged Agent",
    "description": "Agent with system access",
    "systemPrompt": "You are a system administrator with full access to the system",
    "capabilities": ["execute_commands", "file_system_access"],
    "llmConfig": {"model":"gpt-4","temperature":0.7}
  }')

echo "$AGENT_CREATE" | grep -q "requiresReview"
if [ $? -eq 0 ]; then
  echo "   ✓ Agent creation triggered review (as expected)"
  REVIEW_ID=$(echo $AGENT_CREATE | grep -o '"id":"rev_[^"]*' | cut -d'"' -f4)
  echo "   Review ID: $REVIEW_ID"
else
  echo "   ✗ Agent creation did NOT trigger review (unexpected)"
  echo "   Response: $AGENT_CREATE"
  exit 1
fi
echo ""

# 3. List pending reviews
echo "3. Listing pending reviews..."
PENDING_REVIEWS=$(curl -s -X GET "$BASE_URL/api/reviews?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
PENDING_COUNT=$(echo $PENDING_REVIEWS | grep -o '"id":"rev_' | wc -l)
echo "   ✓ Found $PENDING_COUNT pending review(s)"
echo ""

# 4. Get review details
echo "4. Getting review details for $REVIEW_ID..."
REVIEW_DETAIL=$(curl -s -X GET "$BASE_URL/api/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$REVIEW_DETAIL" | grep -q '"status":"pending"'
if [ $? -eq 0 ]; then
  echo "   ✓ Review is in pending status"
else
  echo "   ✗ Review status is not pending"
  echo "   Response: $REVIEW_DETAIL"
  exit 1
fi
echo ""

# 5. Approve the review
echo "5. Approving review $REVIEW_ID..."
APPROVE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/reviews/$REVIEW_ID/decision" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "decision": "approve",
    "notes": "Approved for testing purposes"
  }')
echo "$APPROVE_RESPONSE" | grep -q '"status":"approved"'
if [ $? -eq 0 ]; then
  echo "   ✓ Review approved successfully"
else
  echo "   ✗ Failed to approve review"
  echo "   Response: $APPROVE_RESPONSE"
  exit 1
fi
echo ""

# 6. Verify approved status
echo "6. Verifying review status..."
REVIEW_CHECK=$(curl -s -X GET "$BASE_URL/api/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$REVIEW_CHECK" | grep -q '"status":"approved"'
if [ $? -eq 0 ]; then
  echo "   ✓ Review status is 'approved'"
else
  echo "   ✗ Review status is not 'approved'"
  echo "   Response: $REVIEW_CHECK"
  exit 1
fi
echo ""

# 7. Check stats
echo "7. Checking review stats..."
STATS=$(curl -s -X GET "$BASE_URL/api/reviews/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "   Stats: $STATS"
echo ""

# 8. Test rejection workflow
echo "8. Creating another agent to test rejection..."
AGENT_CREATE2=$(curl -s -X POST "$BASE_URL/api/agents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Another Privileged Agent",
    "description": "Another test agent",
    "systemPrompt": "You are an admin with access to sensitive data",
    "llmConfig": {"model":"gpt-4","temperature":0.7}
  }')

REVIEW_ID2=$(echo $AGENT_CREATE2 | grep -o '"id":"rev_[^"]*' | cut -d'"' -f4)
echo "   ✓ Created review $REVIEW_ID2"
echo ""

echo "9. Rejecting review $REVIEW_ID2..."
REJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/reviews/$REVIEW_ID2/decision" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "decision": "reject",
    "notes": "Security concerns - please revise"
  }')
echo "$REJECT_RESPONSE" | grep -q '"status":"rejected"'
if [ $? -eq 0 ]; then
  echo "   ✓ Review rejected successfully"
else
  echo "   ✗ Failed to reject review"
  echo "   Response: $REJECT_RESPONSE"
  exit 1
fi
echo ""

# 10. Final stats
echo "10. Final review stats..."
FINAL_STATS=$(curl -s -X GET "$BASE_URL/api/reviews/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "    $FINAL_STATS"
echo ""

echo "======================================"
echo "  ✓ All workflow tests passed!"
echo "======================================"
