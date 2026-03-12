# Session Handoff

## Current Objective

- Make CABP (Custom Agent Builder Platform) a stable, remotely reachable service on the Tailscale IP `100.81.83.98`. Secure the deployment by rotating the JWT secret used in CI and on the host, and enable persistent hosting via systemd so the server and client auto‑start on boot.

## Completed Work

- Project moved into `/home/calvin/Repo1` and pushed to GitHub (`MerverliPy/Agent-Builder-Platform-`).
- Backend and frontend scaffolds implemented (Express API + React CRA) with auth, RBAC, media uploads, storage adapters, and tests.
- Dev helpers: `scripts/dev-start.sh` / `scripts/dev-stop.sh` to install deps, build client and start the stack bound to a specified host/IP.
- Static client server: `client/static-server.js` implemented to reliably bind the built client to a non‑localhost IP.
- Docker support: `docker-compose.yml`, `server/Dockerfile`, `client/Dockerfile` added (host networking mode available).
- Systemd templates and installer scaffold created at `/home/calvin/systemd/` and copied into the repo at `/home/calvin/Repo1/systemd/`.
- Dev stack started (no Docker): server bound to `100.81.83.98:5000`, client served at `100.81.83.98:3000`. Logs in `/tmp/cabp-*.log` and PIDs in `/tmp`.
- GitHub Actions `JWT_SECRET` repository secret was created during setup (temporary/weak value). SSH key for this host was added to GitHub so pushes succeeded.

## Pending Work

- Rotate `JWT_SECRET` to a strong value in GitHub Actions and update the host environment (`/etc/cabp.env`).
- Run the systemd installer (`/home/calvin/Repo1/systemd/install-systemd.sh`) as root to copy unit files and enable `cabp-server` and `cabp-client` services.
- Confirm systemd unit `ExecStart` paths are correct for the host's Node installation (unit currently references an nvm path). Update unit if necessary.
- Verify services are healthy after systemd activation and confirm remote access from a Tailscale peer.
- Run full test suites (server and client unit tests, Playwright E2E) and address any failures.

## Relevant Files

- Repo root: `/home/calvin/Repo1/`
- Dev scripts: `/home/calvin/Repo1/scripts/dev-start.sh`, `/home/calvin/Repo1/scripts/dev-stop.sh`
- Server: `/home/calvin/Repo1/server/` (sources in `server/src/`, tests in `server/test/`)
- Client: `/home/calvin/Repo1/client/` (sources in `client/src/`, `client/static-server.js`, build at `client/build`)
- Systemd: `/home/calvin/Repo1/systemd/` and `/home/calvin/systemd/` (unit files and `install-systemd.sh`)
- CI workflows: `/home/calvin/Repo1/.github/workflows/ci.yml`, `/home/calvin/Repo1/.github/workflows/e2e.yml`
- Logs & runtime: `/tmp/cabp-server.log`, `/tmp/cabp-client.log`, `/tmp/cabp-server.pid`, `/tmp/cabp-client.pid`

## Commands to Run

- Start dev stack (no Docker) bound to Tailscale IP:
```
cd /home/calvin/Repo1
export JWT_SECRET="<strong-secret>"
./scripts/dev-start.sh 100.81.83.98
```
- Stop dev stack:
```
./scripts/dev-stop.sh
```
- Build and serve client manually:
```
cd /home/calvin/Repo1/client
npm install --legacy-peer-deps
npm run build
HOST=100.81.83.98 PORT=3000 node static-server.js
```
- Systemd activation (must run as root):
```
sudo tee /etc/cabp.env > /dev/null <<EOF
JWT_SECRET=<the-generated-secret>
HOST=0.0.0.0
PORT=3000
EOF
sudo chmod 600 /etc/cabp.env
sudo bash /home/calvin/Repo1/systemd/install-systemd.sh
sudo systemctl daemon-reload
sudo systemctl restart cabp-server.service cabp-client.service
sudo systemctl status cabp-server.service --no-pager
sudo systemctl status cabp-client.service --no-pager
```

## Known Issues

- The GitHub Actions `JWT_SECRET` that was set is weak — rotate immediately. CI and host env must match new secret.
- Systemd installer requires sudo; I cannot run it in this environment. The installer copies units into `/etc/systemd/system` and enables services.
- The server unit currently references an absolute nvm node path. If Node is installed elsewhere on the host, update the unit's `ExecStart` to the correct node binary or run services under the appropriate user environment.
- The original `serve` tool had issues binding to non‑localhost addresses; `client/static-server.js` replaces it for reliable binding.
- Some npm dependency warnings and audit issues surfaced during installs; consider `npm audit fix` and dependency maintenance.

## Exact Next Step

- Rotate the JWT secret and update GitHub Actions and the host env, then run the systemd installer on the host. Concrete immediate action to execute:

On your host shell (copy/paste):
```
# generate a strong secret
export NEW_SECRET=$(openssl rand -hex 32)

# update GitHub Actions secret (web UI recommended) or use gh locally:
# echo "$NEW_SECRET" | gh secret set JWT_SECRET --repo MerverliPy/Agent-Builder-Platform- --body -

# update host env and enable services (requires sudo):
sudo tee /etc/cabp.env > /dev/null <<EOF
JWT_SECRET=$NEW_SECRET
HOST=0.0.0.0
PORT=3000
EOF
sudo chmod 600 /etc/cabp.env
sudo bash /home/calvin/Repo1/systemd/install-systemd.sh
sudo systemctl daemon-reload
sudo systemctl restart cabp-server.service cabp-client.service
sudo systemctl status cabp-server.service --no-pager
sudo systemctl status cabp-client.service --no-pager
```

I cannot run the sudo steps here; run the block above locally and paste back any `systemctl status` or journal output if services fail — I will troubleshoot and fix unit or environment issues.
