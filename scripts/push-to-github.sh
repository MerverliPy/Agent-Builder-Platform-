#!/bin/bash
# CABP Git Push Script
# This script pushes the prepared commits to GitHub

set -e  # Exit on error

cd /home/calvin/Repo1

echo "================================================"
echo "CABP Git Push Script"
echo "================================================"
echo ""

# Check if we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: You are on branch '$CURRENT_BRANCH', not 'main'"
    echo "Switch to main first: git checkout main"
    exit 1
fi

# Check if there are unpushed commits
COMMITS_TO_PUSH=$(git rev-list --count origin/main..HEAD)
if [ "$COMMITS_TO_PUSH" -eq 0 ]; then
    echo "ℹ️  No commits to push (already up to date)"
    exit 0
fi

echo "📊 Commits to push: $COMMITS_TO_PUSH"
echo ""

# Show the commits that will be pushed
echo "📝 Commits to be pushed:"
git log --oneline origin/main..HEAD
echo ""

# Ask for confirmation
read -p "Continue with push to origin/main? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Push cancelled"
    exit 0
fi

# Perform the push
echo ""
echo "🚀 Pushing commits..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. GitHub Actions E2E workflow will run automatically"
    echo "2. Monitor at: https://github.com/MerverliPy/Agent-Builder-Platform-/actions"
    echo "3. Expect ~64 E2E tests to pass (21 simple + 43 non-simple)"
    echo ""
else
    echo ""
    echo "❌ Push failed"
    exit 1
fi
