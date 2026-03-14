# CABP Automation Scripts

This directory contains helper scripts for development, testing, and deployment workflows.

## 📋 Available Scripts

### 1. `push-to-github.sh` - Push commits to GitHub

**Purpose:** Safely push prepared commits to the GitHub repository with confirmation.

**Usage:**
```bash
./scripts/push-to-github.sh
```

**What it does:**
- Verifies you're on the `main` branch
- Shows commits that will be pushed
- Asks for confirmation before pushing
- Displays success message with next steps
- **Important:** This script will ask for your confirmation before pushing

**Commits to push (as of March 14, 2026):**
- `9defe1e` - docs: add comprehensive project status checklist
- `de6fc9c` - docs: update session handoff with progress from current session
- `25ac730` - docs: add Sandbox feature guide and clarify admin user creation
- `75d009d` - refactor(e2e): simplify resetDatabase hook syntax in crud.spec.js

**Example output:**
```
================================================
CABP Git Push Script
================================================

📊 Commits to push: 4

📝 Commits to be pushed:
9defe1e docs: add comprehensive project status checklist
de6fc9c docs: update session handoff with progress from current session
25ac730 docs: add Sandbox feature guide and clarify admin user creation
75d009d refactor(e2e): simplify resetDatabase hook syntax in crud.spec.js

Continue with push to origin/main? (y/n) y
🚀 Pushing commits...
✅ Push successful!
```

---

### 2. `monitor-ci.sh` - Monitor GitHub Actions workflow

**Purpose:** Monitor the E2E test workflow in real-time after pushing commits.

**Requirements:**
- GitHub CLI (`gh`) installed
- Authenticated with GitHub

**Usage:**
```bash
# First, authenticate with GitHub if not already done
gh auth login

# Then run the monitor
./scripts/monitor-ci.sh
```

**What it does:**
- Fetches the latest E2E workflow run
- Polls the workflow status every 10 seconds
- Displays real-time status updates
- Shows results when workflow completes
- Provides links to view full workflow details

**Example output:**
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
14:24:05 - Status: in_progress | Conclusion: pending
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

---

### 3. `dev-start.sh` - Start development environment (Existing)

Starts server and client bound to Tailscale IP (100.81.83.98).

```bash
./scripts/dev-start.sh 100.81.83.98
```

---

### 4. `dev-stop.sh` - Stop development environment (Existing)

Stops background processes started by dev-start.sh.

```bash
./scripts/dev-stop.sh
```

---

## 🚀 Complete Workflow

### Step 1: Push to GitHub
```bash
./scripts/push-to-github.sh
```
- Review the commits to be pushed
- Confirm the push
- GitHub Actions will automatically trigger

### Step 2: Monitor CI
```bash
./scripts/monitor-ci.sh
```
- Polls the E2E workflow status
- Shows real-time updates
- Reports success/failure when complete

### Step 3: Review Results
After the workflow completes:
- Check the GitHub Actions page for detailed logs
- Review any test failures
- Check artifacts (screenshots, traces, etc.)

---

## 📊 Expected Results

### E2E Test Workflow

**Estimated execution time:** 5-10 minutes

**Expected outcomes:**
- ✅ ~64 tests total (21 simple + 43 non-simple)
- ✅ All tests pass with database reset between suites
- ✅ Server starts successfully on localhost:5000
- ✅ Client builds and serves successfully on localhost:3000
- ✅ Playwright tests execute with proper isolation

**Key milestones in workflow:**
1. ✅ Setup Node.js environment
2. ✅ Install server dependencies
3. ✅ Start backend server (with ENABLE_TEST_ROUTES=true)
4. ✅ Wait for server readiness
5. ✅ Install Playwright browsers
6. ✅ Install client dependencies
7. ✅ Build client
8. ✅ Serve client (static build)
9. ✅ Wait for client readiness
10. ✅ Run Playwright E2E tests (~64 tests)
11. ✅ Collect diagnostics (logs, screenshots, traces)

---

## 🔍 Troubleshooting

### Script Permission Issues

If you get "Permission denied" errors:

```bash
# Make scripts executable
chmod +x ./scripts/*.sh
```

### GitHub CLI Not Authenticated

```bash
# Authenticate with GitHub
gh auth login

# Follow the prompts to generate a personal access token
```

### Workflow Not Starting

If you don't see the workflow after pushing:

1. Check GitHub Actions page: https://github.com/MerverliPy/Agent-Builder-Platform-/actions
2. Verify commits were pushed: `git log --oneline -5`
3. Check if workflow file exists: `.github/workflows/e2e.yml`

### Tests Failing

If E2E tests fail:

1. Check server logs: Look for errors in workflow logs
2. Check client logs: Look for build errors
3. Check database reset: Verify `/api/test/reset` endpoint is working
4. Review test results: Download artifacts from workflow

---

## 📝 Script Details

### push-to-github.sh

**Key features:**
- Checks that you're on `main` branch
- Shows commits before pushing
- Asks for confirmation
- Handles errors gracefully
- Provides next steps

**Exit codes:**
- `0` - Success or user cancelled
- `1` - Error (not on main branch, push failed, etc.)

### monitor-ci.sh

**Key features:**
- Real-time polling (every 10 seconds)
- Timeout after 30 minutes
- Shows job-level results
- Provides clickable GitHub links
- Handles missing workflow runs gracefully

**Exit codes:**
- `0` - Workflow completed (check conclusion for success/failure)
- `1` - Error or timeout

---

## 🎯 Next Steps After Workflow Completes

1. **If all tests pass:**
   - ✅ Commits are ready for next phase
   - ✅ E2E test infrastructure is validated
   - ✅ Ready to test Tailscale network access from another machine

2. **If tests fail:**
   - Review failure logs in GitHub Actions
   - Check `test-results/` directory for screenshots/traces
   - Fix issues and commit again

3. **Test from another Tailscale machine:**
   - Access http://100.81.83.98:3000 from another Tailscale device
   - Verify full application functionality

---

## 📚 Related Documentation

- `SESSION_HANDOFF.md` - Project status and history
- `STATUS.md` - Comprehensive project checklist
- `DEPLOYMENT.md` - Deployment and setup instructions
- `SANDBOX_GUIDE.md` - Agent Sandbox feature guide
- `.github/workflows/e2e.yml` - CI/CD workflow configuration
