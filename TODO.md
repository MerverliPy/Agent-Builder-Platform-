# Project TODO

## High Priority

- Verify full E2E test suite passes in CI (expect ~64 tests: 21 simple + 43 non-simple, all with database isolation)
- Expand `data-testid` coverage to remaining frequently-targeted UI elements (agent list items, all buttons across pages)
- Consider per-test database reset for maximum isolation (currently per-suite via test.beforeAll)
- Test application access from another machine on Tailscale network (verify 100.81.83.98 accessibility)
- Change admin password from default `admin123` to a secure value

## Medium Priority

- Document Agent Sandbox feature usage guide (personality styles, mock responses, conversation persistence)
- Add optional simple E2E test specs to use database reset for consistency
- Integrate full E2E suite diagnostics into CI (capture failures, traces, screenshots)
- Improve E2E test performance and reduce flakiness with better timeout/retry strategies
- Add visual regression testing with Playwright or Percy
- Expand E2E coverage: user profile flows, agent templates, bulk operations
- Implement advanced search and filtering for agents

## Low Priority

- Implement dark mode using design tokens and Tailwind dark variants
- Add nginx reverse proxy with TLS/HSTS for public exposure
- Move uploads to S3 (or object storage) with signed URLs
- Add autoscaling manifests (Kubernetes/Helm) for cloud deploys
- Migrate codebase to TypeScript (long-term)
- Add toast notification system and modal dialog primitives

## Technical Debt

- Consolidate logging and add log rotation for `/var/log/cabp-*.log`
- Fix PostCSS module type warning (add "type": "module" to package.json or rename config)
- Review and harden client dependency chain and address dev-dep vulnerabilities
- Clean up unused CSS after Tailwind migration
- Improve mobile cache-busting strategy for deployments
- Audit environment variable configuration and document all options
- Review Tailscale/network binding for security implications

## New / Discovered Tasks

- Monitor next CI E2E run to identify any remaining flaky tests after database isolation implementation
- Harden Ollama provider handling: availability retries, cache invalidation, and tests
- Add conversation export (download transcript) in sandbox UI
- Add integration tests for LLM routing and conversation persistence (mock + real provider cases)
- Add Playwright traces/screenshots upload to CI artifacts for failing tests
- Document environment variable overrides for local testing (PLAYWRIGHT_BASE_URL, BASE_URL, HOST, PORT)
- Consider configuration file for test settings (instead of env vars only)

## Completed (Recent)

- Converted all 5 non-simple E2E test specs to use `data-testid` selectors and `fillAuthFields` helper
- Implemented test isolation with database reset infrastructure (`/api/test/reset` endpoint)
- Added `test.beforeAll(resetDatabase)` hooks to all non-simple E2E test suites
- Configured Tailscale IP support (100.81.83.98) in vite.config.js, playwright.config.js, and qa-sandbox-fixes.js
- Updated server/client to support configurable bind addresses via environment variables
- Analyzed and documented project architecture (server, client, storage, sandbox)
- Documented sandbox feature: chat interface, mock responses, rate limiting, personality styles
- Created comprehensive Tailscale setup guide with quick start instructions

## Completed (Previous Sessions)

- Migrated client from CRA to Vite and updated build pipeline
- Created systemd unit templates and installer scaffold
- Added Dockerfiles and docker-compose for local/container runs
- Implemented frontend smart inputs (TagInput, ChipSelect, StyleSelector)
- Implemented Agent Sandbox (chat UI, mock responses, session persistence)
- Implemented Ollama provider support and in-memory conversationService
- Fixed Playwright install step in CI (`npx playwright install --with-deps`)
- Added stable `data-testid` attributes and converted simple E2E tests
- All 21 simple E2E tests passing locally and in CI

## Context

- Tailscale IP: `100.81.83.98`
- Server port: `5000` (configurable via PORT env var)
- Client port: `3000` (configured in vite.config.js)
- Test isolation: Implemented via `/api/test/reset` endpoint, called in test.beforeAll hooks
- Environment-aware test routes: Only enabled when ENABLE_TEST_ROUTES=true or NODE_ENV=test
