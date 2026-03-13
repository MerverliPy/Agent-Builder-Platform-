# Project TODO

## High Priority
- Rotate `JWT_SECRET` to a strong value and update GitHub Actions secret.
- Push `fix/client-audit` branch and verify CI (client `npm ci`, tests, build); merge if green.
- Create `migrate/client-to-vite` branch and implement initial Vite scaffold; verify `npm run build` and update CI.
- Run the systemd installer on the host and verify `cabp-server` and `cabp-client` services start on boot.
- Ensure systemd units point to the correct Node binary / environment for the host.
- Verify production-like startup: systemd services bind to Tailscale IP and UI/API are reachable remotely.
- Fix any failing server or client tests and re-run CI pipelines.

## Medium Priority

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
 - Upgraded server `nodemon` to 3.x and updated server lockfile (server audit clean).
 - Created `fix/client-audit` branch with client lockfile updated and client tests passing locally.
 - Added `client/vite-migration-plan.md` to guide migration off CRA.
