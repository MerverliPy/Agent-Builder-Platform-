# Project TODO

## High Priority
- Rotate `JWT_SECRET` to a strong value and update GitHub Actions secret.
- Run the systemd installer on the host and verify `cabp-server` and `cabp-client` services start on boot.
- Ensure systemd units point to the correct Node binary / environment for the host.
- Verify production-like startup: systemd services bind to Tailscale IP and UI/API are reachable remotely.
- Fix any failing server or client tests and re-run CI pipelines.

## Medium Priority
- Harden Playwright E2E: record screenshots, traces and upload artifacts on CI failures.
- Add client-side unit tests for Account page, header auth, and agent flows.
- Add a `docker-compose.override.yml` for local dev that avoids `network_mode: host` and mounts code for hot reload.
- Add CI improvements: dependency caching, lint step, and stricter test matrix.
- Add health checks and readiness endpoints for systemd and container orchestrations.

## Low Priority
- Add nginx reverse proxy with TLS (optional) and HSTS for public exposure.
- Move uploads to S3 (or object storage) and use signed URLs for direct upload/download.
- Add autoscaling and k8s manifests (Helm) for cloud deploys.
- Add a persistent analytics/usage dashboard (Prometheus/Grafana) and alerts.

## Technical Debt
- Run `npm audit fix` and update vulnerable dependencies across client and server; pin fixed versions in lockfiles.
- Consolidate package-lock.json files and ensure `npm ci` works reproducibly in CI for both server and client.
- Remove or archive the stray `.git` at `/home/calvin` if it is not the intended repo root.
- Cleanup and document cleanup task scheduling (cron/systemd timer) for uploads cleanup.
- Consolidate logging to a single location and add log rotation for `/var/log/cabp-*.log`.

## Completed
- Move project into `/home/calvin/Repo1` and initialize git; pushed to GitHub.
- Created dev start/stop scripts and `client/static-server.js` for reliable IP binding.
- Added Dockerfiles and `docker-compose.yml` for host-network compose.
- Added systemd unit templates and installer scaffold under `/home/calvin/systemd`.
- Created and added host SSH key to GitHub to enable SSH pushes.
- Started the dev stack (no Docker): server bound to `100.81.83.98:5000`, client served at `100.81.83.98:3000`.
- Updated CI workflows and set a temporary `JWT_SECRET` Actions secret (needs rotation).
