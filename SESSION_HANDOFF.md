# Session Handoff

## Current Objective

- Migrate the frontend off Create React App to Vite; ensure client builds reproducibly in CI, keep the server stable for host deployment, and complete operational tasks (rotate JWT secret, install systemd units on the host).

## Completed Work

- Repo organized under `/home/calvin/Repo1` with server and client apps and CI workflows.
- Server: implemented Express API, auth, RBAC, agents CRUD, media uploads, cleanup task, and Jest tests; `server/Dockerfile` switched to Debian base and required libs for `sharp`.
- Dev tooling: fixed `scripts/dev-start.sh` to correctly handle HOST/PORT and wait-on; `scripts/dev-stop.sh` present.
- Startup docs: added `startup.txt` (startup instructions) in repo root.
- Dependency fixes: upgraded `nodemon` to 3.x and updated `server/package-lock.json` (audit now clean on server). Server tests pass locally.
- Client: created branch `fix/client-audit` with `npm audit fix --force`, restored `react-scripts@5.0.1`, updated `client/package-lock.json`; client unit tests pass locally.
- CI: added `docker-build.yml` workflow to build images and smoke-test; `JWT_SECRET` Actions secret exists (rotate recommended).
- Migration plan: added `client/vite-migration-plan.md` outlining steps to migrate to Vite.

## Pending Work

- Create `migrate/client-to-vite` branch and implement initial Vite scaffold (install Vite, add `index.html`, update scripts), test build and CI.
- Push `fix/client-audit` branch to remote and open PR for review; verify CI (client `npm ci`, tests, build) and merge if green.
- Rotate `JWT_SECRET` in GitHub Actions and update host `/etc/cabp.env` to the same value.
- Run `systemd/install-systemd.sh` on the host as root, verify `cabp-server` and `cabp-client` services, and confirm remote access via Tailscale.
- Harden client build chain or apply targeted `overrides` to avoid forceful fixes in future; consider adding Dependabot.
- Migrate client tests to Vitest (optional, after Vite migration) and re-run Playwright E2E with artifact capture.

## Relevant Files

- Repository root: `/home/calvin/Repo1`
- Dev scripts: `scripts/dev-start.sh`, `scripts/dev-stop.sh`
- Server: `server/` (sources: `server/src/`, tests: `server/test/`, `server/Dockerfile`)
- Client: `client/` (sources: `client/src/`, `client/package.json`, `client/package-lock.json`, `client/vite-migration-plan.md`)
- Systemd: `systemd/` (`install-systemd.sh`, unit templates)
- CI: `.github/workflows/ci.yml`, `.github/workflows/docker-build.yml`, `.github/workflows/e2e.yml`
- Docs: `startup.txt`, `SESSION_HANDOFF.md`, `TODO.md`

## Commands to Run

- Push audit branch and create PR:
  - git checkout fix/client-audit
  - git push -u origin fix/client-audit
  - gh pr create --title "chore(client): audit fix --force and restore react-scripts" --body "Applied npm audit fix --force in client/, restored react-scripts@5.0.1, updated client/package-lock.json. Verified unit tests locally (npm test)."

- Create migration branch and scaffold Vite (local):
  - git checkout -b migrate/client-to-vite
  - cd client
  - npm install --save-dev vite @vitejs/plugin-react
  - add `index.html` and `vite.config.js`, update `package.json` scripts (`start: vite`, `build: vite build`, `preview: vite preview`)
  - npm run build

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

- `npm audit fix --force` was used in `client/` to reduce reported vulnerabilities; this is forceful and must be reviewed in the PR (we restored `react-scripts@5.0.1` locally).
- CI requires the updated `client/package-lock.json` to be pushed (`npm ci` on runner). `fix/client-audit` branch contains the updated lockfile.
- Systemd installer and service enablement require sudo on the host — cannot be executed from this environment.
- Docker Compose uses `network_mode: host` (Linux-only); adjust compose if running on non-Linux runners or hosts.

## Exact Next Step

- Create the Vite migration branch and apply the initial scaffold locally so we can validate `npm run build` and update CI: execute the "Create migration branch and scaffold Vite" steps above.
