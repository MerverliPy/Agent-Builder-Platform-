# Session Handoff

## Current Objective

- Complete operational tasks for production deployment: rotate JWT secret, install systemd units on the host, and address remaining client dependency issues.

## Completed Work

- Repo organized under `/home/calvin/Repo1` with server and client apps and CI workflows.
- Server: implemented Express API, auth, RBAC, agents CRUD, media uploads, cleanup task, and Jest tests; `server/Dockerfile` switched to Debian base and required libs for `sharp`.
- Dev tooling: fixed `scripts/dev-start.sh` to correctly handle HOST/PORT and wait-on; `scripts/dev-stop.sh` present.
- Startup docs: added `startup.txt` (startup instructions) in repo root.
- Dependency fixes: upgraded `nodemon` to 3.x and updated `server/package-lock.json` (audit now clean on server). Server tests pass locally.
- Client: created branch `fix/client-audit` with `npm audit fix --force`, restored `react-scripts@5.0.1`, updated `client/package-lock.json`; client unit tests pass locally.
- CI: added `docker-build.yml` workflow to build images and smoke-test; `JWT_SECRET` Actions secret exists (rotate recommended). Updated CI to use Node.js 20.x (required for Vite 8).
- **✅ Vite migration COMPLETED and merged to main (PR #2)**:
  - Installed Vite 8.0.0 and @vitejs/plugin-react 6.0.0
  - Created `client/index.html` and `client/vite.config.js` with dev server proxy
  - Updated `package.json` scripts (start: vite, build: vite build, preview: vite preview)
  - Renamed all JSX files from `.js` to `.jsx` (15 files: components, pages, contexts)
  - Updated all build artifact references from `build/` to `dist/` (Dockerfile, CI workflows, dev scripts, static-server.js)
  - Fixed CI: removed npm cache config (monorepo incompatibility), upgraded Node.js 18→20
  - CI verified: ✅ build succeeds (~100ms), ✅ tests pass, ✅ bundle: 177.62 kB JS (57.21 kB gzipped)
  - Merged via PR #2 with squash merge

## Pending Work

- Push `fix/client-audit` branch to remote and open PR for review; verify CI (client `npm ci`, tests, build) - may no longer be needed since Vite migration eliminates many CRA vulnerabilities.
- Rotate `JWT_SECRET` in GitHub Actions and update host `/etc/cabp.env` to the same value.
- Run `systemd/install-systemd.sh` on the host as root, verify `cabp-server` and `cabp-client` services, and confirm remote access via Tailscale.
- Run Docker Build workflow on main branch to verify images build correctly with Vite.
- Harden client build chain or apply targeted `overrides` to avoid forceful fixes in future; consider adding Dependabot.
- Migrate client tests to Vitest (optional, for full Vite stack) and re-run Playwright E2E with artifact capture.

## Relevant Files

- Repository root: `/home/calvin/Repo1`
- Dev scripts: `scripts/dev-start.sh`, `scripts/dev-stop.sh`
- Server: `server/` (sources: `server/src/`, tests: `server/test/`, `server/Dockerfile`)
- Client: `client/` (sources: `client/src/`, `client/package.json`, `client/vite.config.js`, `client/index.html`)
- Systemd: `systemd/` (`install-systemd.sh`, unit templates)
- CI: `.github/workflows/ci.yml`, `.github/workflows/docker-build.yml`, `.github/workflows/e2e.yml`
- Docs: `startup.txt`, `SESSION_HANDOFF.md`, `TODO.md`, `client/vite-migration-plan.md`

## Commands to Run

- Trigger Docker Build workflow to verify main branch:
  - gh workflow run docker-build.yml
  - gh run watch (or check GitHub Actions tab)

- Push audit branch and create PR (optional - evaluate if still needed):
  - git checkout fix/client-audit
  - git push -u origin fix/client-audit
  - gh pr create --title "chore(client): audit fix --force and restore react-scripts" --body "Applied npm audit fix --force in client/, restored react-scripts@5.0.1, updated client/package-lock.json. Verified unit tests locally (npm test). NOTE: May be obsolete since Vite migration eliminates many CRA vulnerabilities."

- Systemd install on host (must run as root):
  - sudo tee /etc/cabp.env > /dev/null <<EOF
  - JWT_SECRET=<NEW_SECRET>
  - HOST=0.0.0.0
  - PORT=3000
  - EOF
  - sudo chmod 600 /etc/cabp.env
  - sudo bash /home/calvin/Repo1/systemd/install-systemd.sh
  - sudo systemctl daemon-reload
  - sudo systemctl restart cabp-server.service cabp-client.service
  - sudo systemctl status cabp-server.service --no-pager

## Known Issues

- `fix/client-audit` branch may no longer be needed since the Vite migration eliminates most CRA-related vulnerabilities; evaluate before opening PR.
- Client build output changed from `build/` to `dist/`; all references have been updated.
- Tests still use `react-scripts test` (Jest); migration to Vitest is optional future work.
- CI workflows now require Node.js 20.x (Vite 8 requirement); updated in all workflows.
- Systemd installer and service enablement require sudo on the host — cannot be executed from this environment.
- Docker Compose uses `network_mode: host` (Linux-only); adjust compose if running on non-Linux runners or hosts.
- Docker Build workflow should be triggered manually to verify main branch builds correctly with Vite.

## Exact Next Step

- Trigger the Docker Build workflow on main branch to verify Docker images build correctly with Vite: `gh workflow run docker-build.yml && gh run watch`
