# Session Handoff

## Current Objective

Stabilize Playwright E2E for the client (prefer `data-testid` selectors, use `fillAuthFields` helper), ensure the simple E2E suite runs reliably locally and in CI, and complete remaining E2E hardening and CI diagnostics.

## Completed Work

- Added `data-testid` attributes and stable hooks to key UI elements (agent name input, submit button, preview name, agent card actions).
- Implemented and used `fillAuthFields` helper for auth flows; updated tests to prefer `data-testid` and fallback selectors.
- Converted and stabilized all simple Playwright tests: `tests/e2e/*-simple.spec.js` now pass locally (21/21).
- Fixed brittle navigation/localStorage access in tests and made CLI-based Playwright install the canonical approach (`npx playwright install --with-deps`).
- Rebuilt client and restarted dev server so tests run against updated DOM.
- Ran local test suites: Playwright simple E2E (21/21 passed) and Vitest unit tests (46/46 passed).
- Committed and pushed changes to `main` (commit f5df4ee).
- **Inspected CI E2E run (23070785396)**: 15/21 tests passed, 6 failed due to API routing issue.
- **Diagnosed root cause**: Static client build defaults to relative `/api` path, but API runs on different port in CI (5000 vs 3000).
- **Fixed**: Added `VITE_API_BASE=http://localhost:5000/api` env var to client build step in `.github/workflows/e2e.yml`.
- **Verified fix (run 23071229646)**: All 21 simple E2E tests now pass in CI (commit f36a4e4).

## Pending Work

- Convert remaining non-simple E2E specs to prefer `data-testid` and the helper where gaps remain (`tests/e2e/*.spec.js`).
- Add `data-testid` to any remaining frequently-targeted UI elements (agent list items, create/save buttons across pages).
- Implement test isolation (database cleanup) for full E2E reliability and repeatability.
- Consider making VITE_API_BASE configurable at runtime for flexible deployment (vs. build-time only).

## Relevant Files

- `client/tests/e2e/utils.js` — `fillAuthFields` helper and selector constants.
- `client/src/components/AgentForm.jsx` — `data-testid="agent-name"`, `data-testid="agentform-submit"`.
- `client/src/components/agent/AgentPreviewCard.jsx` — `data-testid="agent-preview-name"`.
- `client/src/components/AgentCard.jsx` — `data-testid` attributes for cards and actions.
- `client/tests/e2e/*-simple.spec.js` — converted Playwright simple suites (auth, crud, errors, navigation).
- `.github/workflows/e2e.yml` — uses CLI Playwright install and uploads diagnostics (verify on CI run).
- `scripts/dev-start.sh` / `scripts/dev-stop.sh` — dev server lifecycle used during local runs.

## Commands to Run

- Install Playwright browsers: `cd client && npx playwright install --with-deps`
- Run simple E2E suite locally: `cd client && npx playwright test --reporter=list`
- Run a single failing test: `cd client && npx playwright test tests/e2e/crud-simple.spec.js -g "should create a new agent" --project=chromium --reporter=list`
- Run unit tests: `cd client && npm test` and `cd server && npm test`
- Build & serve client (production): `cd client && npm run build && ./scripts/dev-start.sh 127.0.0.1`
- Trigger/inspect CI run: `gh run list --workflow=e2e.yml` then `gh run view <id> --log`; re-run: `gh run rerun <id>`.

## Known Issues

- **[RESOLVED] CI E2E failures (run 23070785396)**: Fixed in commit f36a4e4, verified passing in run 23071229646.
- Some non-simple E2E tests still use fallback or placeholder selectors — audit and convert these to `data-testid` for full-suite stability.
- Search input components render readonly inputs; tests must avoid filling readonly inputs (the helper already guards against this).

## Exact Next Step

**Simple E2E CI objective complete! All 21 tests pass locally and in CI.** Next steps for full E2E hardening:

1. Convert remaining non-simple E2E specs (`tests/e2e/*.spec.js`) to use `data-testid` selectors and `fillAuthFields` helper.
2. Add test isolation: implement database cleanup between tests for repeatability.
3. Expand `data-testid` coverage to remaining UI elements (agent list items, buttons across all pages).
4. Run full E2E suite in CI and address any additional failures.
