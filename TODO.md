# Project TODO

## High Priority

- Add `data-testid` attributes to key form inputs for Playwright stability
- Implement drag-and-drop avatar upload for AgentCreatePage
- Implement test isolation with database cleanup between E2E tests
- Create Page Object Model for E2E maintainability and stable selectors
- Change admin password from default `admin123` to a secure value
- Integrate E2E tests into CI (ensure Playwright install/logging robust on ubuntu-24.04)

## Medium Priority

- Add visual regression testing with Playwright or Percy
- Expand E2E coverage: user profile flows, agent templates, bulk operations
- Improve E2E test performance and flakiness mitigations (timeouts, retries)
- Implement advanced search and filtering for agents
- Add toast notification system and modal dialog primitives

## Low Priority

- Implement dark mode using design tokens and Tailwind dark variants
- Add nginx reverse proxy with TLS/HSTS for public exposure
- Move uploads to S3 (or object storage) with signed URLs
- Add autoscaling manifests (Kubernetes/Helm) for cloud deploys
- Migrate codebase to TypeScript (long-term)

## Technical Debt

- Consolidate logging and add log rotation for `/var/log/cabp-*.log`
- Fix PostCSS module type warning (add "type": "module" to package.json or rename config)
- Review and harden client dependency chain and address dev-dep vulnerabilities
- Clean up unused CSS after Tailwind migration
- Improve mobile cache-busting strategy for deployments

## New / Discovered Tasks

- Fetch and analyze E2E run logs for run `23065345021` and fix failures (Playwright install or brittle selectors).
- Harden Ollama provider handling: availability retries, cache invalidation, and tests.
- Add conversation export (download transcript) in sandbox UI.
- Add integration tests for LLM routing and conversation persistence (mock + real provider cases).

## Completed

- Migrated client from CRA to Vite and updated build pipeline
- Created systemd unit templates and installer scaffold
- Added Dockerfiles and docker-compose for local/container runs
- Implemented frontend smart inputs (TagInput, ChipSelect, StyleSelector)
- Implemented Agent Sandbox (chat UI, mock responses, session persistence)
- Implemented Ollama provider support and in-memory conversationService
- Fixed Playwright install step in CI (`npx playwright install --with-deps`) and verified Docker Build & CI workflows

## Recently Completed (context)

- Added Ollama provider support and conversationService; updated frontend model selector; made Playwright install step robust (commit `8e9866f`).

(End of file)
