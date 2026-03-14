#!/bin/bash

# Manual testing script for Review System

BASE_URL="http://localhost:5000"

echo "=== Review System Manual Test ==="
echo ""

# 1. Register admin user
echo "1. Registering admin user..."
ADMIN_REG=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","password":"admin123"}')
echo "Response: $ADMIN_REG"
echo ""

# 2. Login as admin
echo "2. Logging in as admin..."
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","password":"admin123"}')
echo "Response: $ADMIN_LOGIN"
ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Admin token: $ADMIN_TOKEN"
echo ""

# 3. Set admin role via test endpoint
echo "3. Setting admin role..."
curl -s -X POST "$BASE_URL/api/test/set-roles" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testadmin\",\"roles\":[\"admin\",\"reviewer\"]}"
echo ""
echo ""

# 4. Create an agent with high privilege (should trigger review)
echo "4. Creating agent with high privileges (should trigger review)..."
AGENT_CREATE=$(curl -s -X POST "$BASE_URL/api/agents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "High Privilege Agent",
    "description": "Test agent with system access",
    "systemPrompt": "You are a system admin agent with full access",
    "capabilities": ["execute_commands", "file_system_access", "network_access"],
    "llmConfig": {"model":"gpt-4","temperature":0.7}
  }')
echo "Response: $AGENT_CREATE"
echo ""

# 5. List review items
echo "5. Listing review items..."
REVIEWS=$(curl -s -X GET "$BASE_URL/api/reviews" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Response: $REVIEWS"
echo ""

# 6. Get stats
echo "6. Getting review stats..."
STATS=$(curl -s -X GET "$BASE_URL/api/reviews/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Response: $STATS"
echo ""

echo "=== Manual Test Complete ==="
