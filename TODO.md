# Project TODO

## High Priority
- Run systemd installer on host and verify `cabp-server` and `cabp-client` services start on boot.
- Ensure systemd units point to correct Node binary/environment for the host.
- Verify production startup: systemd services bind to Tailscale IP and UI/API are reachable remotely.

## Medium Priority
- Migrate client tests to Vitest for full Vite stack consistency.
- Re-run Playwright E2E tests with artifact capture enabled.
- Add Dependabot or Renovate for automated dependency updates.
- Document cleanup task scheduling (cron/systemd timer) for uploads cleanup.

## Low Priority
- Add nginx reverse proxy with TLS and HSTS for public exposure.
- Move uploads to S3 (or object storage) with signed URLs.
- Add autoscaling and k8s manifests (Helm) for cloud deploys.
- Add persistent analytics/usage dashboard (Prometheus/Grafana) and alerts.

## Technical Debt
- Consolidate logging and add log rotation for `/var/log/cabp-*.log`.
- Remove or archive stray `.git` at `/home/calvin` if not intended repo root.
- Review and harden client dependency chain with targeted `overrides` if needed.

## Completed
- Move project into `/home/calvin/Repo1` and initialize git; pushed to GitHub.
- Created dev start/stop scripts and `client/static-server.js` for IP binding.
- Added Dockerfiles and `docker-compose.yml` for host-network compose.
- Added systemd unit templates and installer scaffold under `systemd/`.
- Created and added host SSH key to GitHub.
- Updated CI workflows and set temporary `JWT_SECRET` Actions secret.
- Upgraded server `nodemon` to 3.x and updated server lockfile (audit clean).
- Created `fix/client-audit` branch with updated lockfile and passing tests.
- Added `client/vite-migration-plan.md`.
- Migrated client from CRA to Vite 8.0.0 (PR #2 merged to main).
- Renamed all JSX files from .js to .jsx (15 files).
- Updated build artifacts from `build/` to `dist/` across codebase.
- Fixed CI: removed npm cache config, upgraded Node 18→20 for Vite compatibility.
- Verified CI passes: build, tests, bundle optimization.
- Fixed client Dockerfile: upgraded to Node.js 20 for Vite 8 compatibility.
- Fixed docker-build.yml: added HOST=0.0.0.0 for server container.
- Verified Docker Build workflow passes (run #23034876087): both images build, smoke tests pass.
- Evaluated fix/client-audit branch: confirmed obsolete (vulnerabilities only in dev deps).
- Moved react-scripts to devDependencies (production builds use Vite only).
- Deleted fix/client-audit branch locally and remotely.
- Rotated JWT_SECRET in GitHub Actions (32-byte base64, set 2026-03-13).
- Documented JWT_SECRET value in SESSION_HANDOFF.md for host systemd installation.
