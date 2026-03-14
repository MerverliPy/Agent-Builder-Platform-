#!/bin/bash
# CABP CI Monitoring Script
# This script monitors the GitHub Actions E2E workflow after pushing commits

set -e

REPO="MerverliPy/Agent-Builder-Platform-"
WORKFLOW_NAME="E2E Tests"
MAX_WAIT_MINUTES=30

echo "================================================"
echo "CABP CI Monitoring Script"
echo "================================================"
echo ""
echo "Repository: $REPO"
echo "Workflow: $WORKFLOW_NAME"
echo "Max wait time: $MAX_WAIT_MINUTES minutes"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "Install it with: sudo apt-get install gh"
    exit 1
fi

# Authenticate with gh if needed
echo "🔐 Checking GitHub authentication..."
if ! gh auth status &> /dev/null; then
    echo "⚠️  GitHub CLI not authenticated. Please run:"
    echo "   gh auth login"
    exit 1
fi
echo "✅ Authenticated"
echo ""

# Get the latest workflow run
echo "📋 Fetching latest workflow run..."
LATEST_RUN=$(gh run list --repo "$REPO" --workflow "$WORKFLOW_NAME" --limit 1 --json databaseId --jq '.[0].databaseId')

if [ -z "$LATEST_RUN" ]; then
    echo "⚠️  No workflow runs found yet"
    echo "   Workflow may not have started. Check back in a few seconds."
    exit 0
fi

echo "Found run: $LATEST_RUN"
echo ""

# Monitor the workflow
START_TIME=$(date +%s)
TIMEOUT=$((MAX_WAIT_MINUTES * 60))

while true; do
    # Get run status
    STATUS=$(gh run view "$LATEST_RUN" --repo "$REPO" --json status --jq '.status')
    CONCLUSION=$(gh run view "$LATEST_RUN" --repo "$REPO" --json conclusion --jq '.conclusion // empty')
    
    echo "$(date '+%H:%M:%S') - Status: $STATUS | Conclusion: ${CONCLUSION:-pending}"
    
    # Check if completed
    if [ "$STATUS" = "completed" ]; then
        echo ""
        echo "================================================"
        if [ "$CONCLUSION" = "success" ]; then
            echo "✅ WORKFLOW SUCCESSFUL!"
        elif [ "$CONCLUSION" = "failure" ]; then
            echo "❌ WORKFLOW FAILED"
        else
            echo "⚠️  WORKFLOW COMPLETED: $CONCLUSION"
        fi
        echo "================================================"
        echo ""
        
        # Show test results
        echo "📊 Test Results:"
        gh run view "$LATEST_RUN" --repo "$REPO" --json jobs --jq '.jobs[] | .name + ": " + .conclusion'
        echo ""
        
        # Provide links
        echo "🔗 Links:"
        echo "   Full workflow: https://github.com/$REPO/actions/runs/$LATEST_RUN"
        echo "   Repository: https://github.com/$REPO"
        echo ""
        break
    fi
    
    # Check timeout
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    if [ $ELAPSED -gt $TIMEOUT ]; then
        echo ""
        echo "⏱️  Timeout: Workflow still running after $MAX_WAIT_MINUTES minutes"
        echo "View it at: https://github.com/$REPO/actions/runs/$LATEST_RUN"
        exit 1
    fi
    
    # Wait before checking again
    sleep 10
done
