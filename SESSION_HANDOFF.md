# Session Handoff

## Current Objective

Complete operational tasks for production deployment: rotate JWT secret and install systemd units on the host.

## Completed Work

- Repo organized under `/home/calvin/Repo1` with server and client apps and CI workflows.
- Server: implemented Express API, auth, RBAC, agents CRUD, media uploads, cleanup task, and Jest tests; `server/Dockerfile` uses Debian base with libs for `sharp`.
- Dev tooling: `scripts/dev-start.sh` handles HOST/PORT and wait-on; `scripts/dev-stop.sh` present.
- Startup docs: `startup.txt` in repo root.
- Server dependencies: upgraded `nodemon` to 3.x, updated `server/package-lock.json` (audit clean), tests pass.
- CI: added `docker-build.yml` workflow; `JWT_SECRET` Actions secret exists (rotate recommended); upgraded to Node.js 20.x.
- **Vite migration merged to main (PR #2)**:
  - Installed Vite 8.0.0 and @vitejs/plugin-react 6.0.0
  - Created `client/index.html` and `client/vite.config.js` with dev server proxy
  - Updated scripts: `start` (vite), `build` (vite build), `preview` (vite preview)
  - Renamed 15 JSX files from .js to .jsx
  - Updated build artifacts from `build/` to `dist/` in Dockerfile, CI workflows, dev scripts, static-server.js
  - Fixed CI: removed npm cache config, upgraded Node 18→20
  - Build: ~100ms, bundle: 177.62 kB JS (57.21 kB gzipped), tests pass
- **✅ Docker Build workflow verified (run #23034876087)**:
  - Fixed `client/Dockerfile`: upgraded from Node 18 to Node 20 for Vite 8 compatibility
  - Fixed `docker-build.yml`: added HOST=0.0.0.0 for server container
  - Both server and client images build successfully
  - Smoke tests pass: server health check and client serving verified
- **✅ Evaluated and removed fix/client-audit branch**:
  - Confirmed react-scripts vulnerabilities (26 total) only affect dev dependencies
  - Production builds use Vite and don't include react-scripts
  - Moved react-scripts to devDependencies (only used for testing)
  - Deleted obsolete fix/client-audit branch locally and remotely
- **✅ Rotated JWT_SECRET**:
  - Generated new strong secret (32-byte base64)
  - Updated GitHub Actions secret (set on 2026-03-13)
  - Secret value: `KvSTAg6dBxxpSvcQ0SUgVV7Qjxh6Sh/0NKhiVzix0MY=`
  - NOTE: Use this same value for `/etc/cabp.env` on host
- **✅ Installed and verified systemd units on host**:
  - Created `/etc/cabp.env` with JWT_SECRET and HOST=0.0.0.0
  - Updated systemd units to use full path to nvm node binary (`/home/calvin/.nvm/versions/node/v20.20.1/bin/node`)
  - Configured server on port 5000, client on port 3000
  - Both services running and enabled on boot
  - Server health check: `http://100.81.83.98:5000/api/health` ✓
  - Client serving: `http://100.81.83.98:3000` ✓
  - Logs: `/var/log/cabp-server.log` and `/var/log/cabp-client.log`

## Pending Work

- Optional: migrate tests to Vitest, re-run E2E with artifact capture.
- Optional: improve systemd unit installer to better detect nvm node paths.

## Relevant Files

- Repository root: `/home/calvin/Repo1`
- Dev scripts: `scripts/dev-start.sh`, `scripts/dev-stop.sh`
- Server: `server/` (sources: `server/src/`, tests: `server/test/`, `server/Dockerfile`)
- Client: `client/` (sources: `client/src/`, `client/package.json`, `client/vite.config.js`, `client/index.html`)
- Systemd: `systemd/` (`install-systemd.sh`, unit templates), `/etc/systemd/system/cabp-*.service`
- CI: `.github/workflows/ci.yml`, `.github/workflows/docker-build.yml`, `.github/workflows/e2e.yml`
- Docs: `startup.txt`, `SESSION_HANDOFF.md`, `TODO.md`, `ARCHITECTURE.md`, `client/vite-migration-plan.md`
- Logs: `/var/log/cabp-server.log`, `/var/log/cabp-client.log`

## Service Management

Check service status:
```
sudo systemctl status cabp-server.service cabp-client.service
```

View logs:
```
sudo tail -f /var/log/cabp-server.log
sudo tail -f /var/log/cabp-client.log
```

Restart services:
```
sudo systemctl restart cabp-server.service cabp-client.service
```

## Access Points

- Server API: `http://100.81.83.98:5000/api/`
- Server Health: `http://100.81.83.98:5000/api/health`
- Client UI: `http://100.81.83.98:3000`

## Known Issues

- Systemd installer doesn't automatically detect nvm node paths (manual fix required).
- Client build output: `build/` → `dist/` (all references updated).
- Tests use `react-scripts test` (Jest); Vitest migration optional.
- Dev dependencies have 26 vulnerabilities from react-scripts (dev only, not in production).
- CI requires Node.js 20.x (Vite 8 requirement).
- Docker Compose uses `network_mode: host` (Linux-only).

## Production Deployment Complete ✅

All operational tasks for production deployment have been completed:
- ✅ Docker builds verified on CI
- ✅ JWT secret rotated
- ✅ Systemd units installed and running
- ✅ Services accessible via Tailscale

Optional follow-up work:
- Migrate client tests from Jest to Vitest for full Vite stack consistency
- Re-run Playwright E2E tests with artifact capture
- Improve systemd installer to auto-detect nvm node paths
