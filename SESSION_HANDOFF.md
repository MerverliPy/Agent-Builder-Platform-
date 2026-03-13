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

## Pending Work

- Rotate `JWT_SECRET` in GitHub Actions and update host `/etc/cabp.env`.
- Install systemd units on host, verify `cabp-server` and `cabp-client` services.
- Verify remote access via Tailscale.
- Optional: migrate tests to Vitest, re-run E2E with artifact capture.

## Relevant Files

- Repository root: `/home/calvin/Repo1`
- Dev scripts: `scripts/dev-start.sh`, `scripts/dev-stop.sh`
- Server: `server/` (sources: `server/src/`, tests: `server/test/`, `server/Dockerfile`)
- Client: `client/` (sources: `client/src/`, `client/package.json`, `client/vite.config.js`, `client/index.html`)
- Systemd: `systemd/` (`install-systemd.sh`, unit templates)
- CI: `.github/workflows/ci.yml`, `.github/workflows/docker-build.yml`, `.github/workflows/e2e.yml`
- Docs: `startup.txt`, `SESSION_HANDOFF.md`, `TODO.md`, `client/vite-migration-plan.md`

## Commands to Run

Rotate JWT secret:
```
gh secret set JWT_SECRET
```

Systemd install on host (as root):
```
sudo tee /etc/cabp.env > /dev/null <<EOF
JWT_SECRET=<NEW_SECRET>
HOST=0.0.0.0
PORT=3000
EOF
sudo chmod 600 /etc/cabp.env
sudo bash /home/calvin/Repo1/systemd/install-systemd.sh
sudo systemctl daemon-reload
sudo systemctl restart cabp-server.service cabp-client.service
sudo systemctl status cabp-server.service --no-pager
```

## Known Issues

- Client build output: `build/` → `dist/` (all references updated).
- Tests use `react-scripts test` (Jest); Vitest migration optional.
- Dev dependencies have 26 vulnerabilities from react-scripts (dev only, not in production).
- CI requires Node.js 20.x (Vite 8 requirement).
- Systemd install requires sudo on host.
- Docker Compose uses `network_mode: host` (Linux-only).

## Exact Next Step

Rotate JWT_SECRET in GitHub Actions: `gh secret set JWT_SECRET`
