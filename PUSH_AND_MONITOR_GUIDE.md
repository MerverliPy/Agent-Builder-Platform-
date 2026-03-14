# Quick Start: Push to GitHub & Monitor CI

This guide walks you through pushing your prepared commits and monitoring the CI workflow.

## 📋 Prerequisites

- ✅ 4 commits ready to push (created during this session)
- ✅ GitHub authentication (via SSH or HTTPS)
- ✅ GitHub CLI (`gh`) installed and authenticated

## 🚀 Step-by-Step Instructions

### Step 1: Review Commits (Optional)

View the commits that are ready to be pushed:

```bash
cd /home/calvin/Repo1
git log --oneline origin/main..HEAD
```

You should see these 5 commits (the most recent being the automation scripts):

```
4b6c735 scripts: add git push and CI monitoring automation
9defe1e docs: add comprehensive project status checklist
de6fc9c docs: update session handoff with progress from current session
25ac730 docs: add Sandbox feature guide and clarify admin user creation
75d009d refactor(e2e): simplify resetDatabase hook syntax in crud.spec.js
```

### Step 2: Push to GitHub

Run the push script:

```bash
./scripts/push-to-github.sh
```

This will:
1. ✅ Verify you're on the `main` branch
2. ✅ Show the commits to be pushed
3. ✅ Ask for confirmation (type `y` and press Enter)
4. ✅ Push commits to GitHub
5. ✅ Display confirmation message

**Expected output:**
```
================================================
CABP Git Push Script
================================================

📊 Commits to push: 5

📝 Commits to be pushed:
4b6c735 scripts: add git push and CI monitoring automation
9defe1e docs: add comprehensive project status checklist
de6fc9c docs: update session handoff with progress from current session
25ac730 docs: add Sandbox feature guide and clarify admin user creation
75d009d refactor(e2e): simplify resetDatabase hook syntax in crud.spec.js

Continue with push to origin/main? (y/n) y
🚀 Pushing commits...
✅ Push successful!

📋 Next steps:
1. GitHub Actions E2E workflow will run automatically
2. Monitor at: https://github.com/MerverliPy/Agent-Builder-Platform-/actions
3. Expect ~64 E2E tests to pass (21 simple + 43 non-simple)
```

### Step 3: Monitor CI Workflow (Optional)

After pushing, you can monitor the E2E workflow automatically:

```bash
./scripts/monitor-ci.sh
```

This will:
1. ✅ Fetch the latest workflow run
2. ✅ Poll status every 10 seconds
3. ✅ Display real-time updates
4. ✅ Show results when complete (success/failure)
5. ✅ Provide links to GitHub Actions page

**Expected output:**
```
================================================
CABP CI Monitoring Script
================================================

Repository: MerverliPy/Agent-Builder-Platform-
Workflow: E2E Tests
Max wait time: 30 minutes

🔐 Checking GitHub authentication...
✅ Authenticated

📋 Fetching latest workflow run...
Found run: 8234567890

14:23:45 - Status: in_progress | Conclusion: pending
14:23:55 - Status: in_progress | Conclusion: pending
...
14:28:45 - Status: completed | Conclusion: success

================================================
✅ WORKFLOW SUCCESSFUL!
================================================

📊 Test Results:
E2E Tests: success

🔗 Links:
   Full workflow: https://github.com/MerverliPy/Agent-Builder-Platform-/actions/runs/8234567890
   Repository: https://github.com/MerverliPy/Agent-Builder-Platform-
```

## 📊 What to Expect

### Workflow Duration
- **Typical time:** 5-10 minutes
- **Includes:**
  - Setup Node.js environment
  - Install dependencies (server, client, Playwright)
  - Start backend server (with test helpers enabled)
  - Build frontend
  - Run ~64 E2E tests

### Expected Test Results
- ✅ **21 simple E2E tests** - Quick smoke tests
- ✅ **43 non-simple E2E tests** - Full test suite with database isolation
- ✅ **Database reset** between test suites for isolation

### Artifacts Generated
If tests run, GitHub will save:
- `playwright-report/` - HTML test report
- `test-results/` - Test result JSON files
- Screenshots of failures (if any)
- Server and client logs

## 🔗 View Results

### Option 1: Monitor Script (Real-time)
```bash
./scripts/monitor-ci.sh
```

### Option 2: GitHub Actions Page
Visit: https://github.com/MerverliPy/Agent-Builder-Platform-/actions

### Option 3: Manual Check
```bash
# View latest workflow run
gh run list --repo MerverliPy/Agent-Builder-Platform- --workflow "E2E Tests" --limit 1

# View workflow details
gh run view [RUN_ID] --repo MerverliPy/Agent-Builder-Platform-
```

## ✅ Success Criteria

All of these should be true after the workflow completes:

- [x] Commits successfully pushed to `main` branch
- [ ] GitHub Actions E2E workflow runs automatically
- [ ] All ~64 tests pass
- [ ] No test failures or timeouts
- [ ] Workflow completes with `success` conclusion

## ❌ Troubleshooting

### Script won't run
```bash
# Make scripts executable
chmod +x ./scripts/*.sh
```

### "GitHub authentication failed"
```bash
# Authenticate with GitHub CLI
gh auth login
# Follow the prompts to create a personal access token
```

### "Workflow not found"
- Wait 1-2 minutes after pushing (GitHub needs time to detect push)
- Check that commits were actually pushed: `git log --oneline -1`
- Visit Actions page manually: https://github.com/MerverliPy/Agent-Builder-Platform-/actions

### Tests fail
- Review workflow logs in GitHub Actions
- Check for server startup errors
- Verify database reset is working
- Look for Playwright errors in logs

## 📝 Next Steps

### If All Tests Pass ✅
1. Celebrate! 🎉 Database isolation is working
2. Next task: Test application from another Tailscale machine
   - Access: http://100.81.83.98:3000
   - Verify features work across network
3. Optional: Consider per-test database reset for even better isolation

### If Tests Fail ❌
1. Review GitHub Actions logs in detail
2. Check for common issues:
   - Server startup problems
   - Playwright installation issues
   - Test timeout or rate limiting
   - Database reset endpoint not responding
3. Fix issues and push a new commit

## 🎯 One-Liner Commands

**Quick push + monitor:**
```bash
./scripts/push-to-github.sh && echo "Waiting 5 seconds before monitoring..." && sleep 5 && ./scripts/monitor-ci.sh
```

**Check current status:**
```bash
git log --oneline origin/main..HEAD | wc -l && echo "commits to push"
```

**View workflow from terminal:**
```bash
gh run view --repo MerverliPy/Agent-Builder-Platform- --web
```

## 📚 More Information

For detailed documentation, see:
- `scripts/README.md` - Complete scripts documentation
- `SESSION_HANDOFF.md` - Project history and context
- `STATUS.md` - Comprehensive project checklist
- `DEPLOYMENT.md` - Deployment instructions
- `.github/workflows/e2e.yml` - Workflow definition
