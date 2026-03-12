# Project Architecture

## Overview

Custom Agent Builder Platform (CABP) is a minimal full‑stack application that lets users create and manage lightweight "agents" via a React single‑page app and a Node/Express HTTP API. The system is designed for rapid local development and simple deployment on a single host (via systemd or Docker Compose), with clear separation between API, frontend, storage, and media handling.

## Major Components

- API (server/) — Node.js + Express application exposing REST endpoints for auth, agent CRUD, media uploads, and health.
- Frontend (client/) — React app (CRA) that provides the UI for listing, creating, editing and deleting agents, login/account flows, and client‑side routing.
- Storage adapters (server/src/storage/) — abstraction with in‑memory and file‑backed adapters so persistence strategy can be swapped without changing business logic.
- Media handling — multipart uploads via multer, optional image processing via sharp, static serving of upload artifacts, and a cleanup task/CLI that prunes old files.
- Auth & RBAC — JWT tokens issued at login, server‑side verification (`requireAuth`) and role checks (`requireRole`) enforce permissions; frontend decodes JWT for UX gating only.
- Dev & Ops helpers — dev start/stop scripts, a small static server to bind the built client to a specific host/IP, Dockerfiles + docker‑compose for containerized runs, and systemd unit templates for host provisioning.
- CI & E2E — GitHub Actions workflows for unit tests and Playwright E2E, with CI configured to obtain `JWT_SECRET` from repository secrets.

## Data Flow

1. Client requests a page (SPA) from the static server (or CRA dev server). The SPA fetches data from API endpoints under `/api/*`.
2. Authentication:
   - User registers (dev endpoints) or logs in via `/api/auth/login`. Server verifies credentials and returns a signed JWT.
   - Client stores JWT (localStorage) and includes `Authorization: Bearer <token>` on protected API requests.
   - Server verifies JWT using `JWT_SECRET` and attaches the decoded `req.user` to requests.
3. Agents CRUD:
   - Client calls `/api/agents` endpoints. Mutating endpoints require authentication and appropriate roles — server middleware validates `req.user.roles`.
   - Data persists through the selected storage adapter (in‑memory for dev, file for simple persistence).
4. Media uploads:
   - Client uploads files to `/api/media` (multipart). Server saves files to `uploads/` (or adapter) and returns URLs.
   - A scheduled or on‑demand cleanup task removes stale uploads based on TTL.

## Key Technologies

- Node.js (v18+/v20 used in development) and Express
- React (CRA) for the frontend
- jsonwebtoken, bcryptjs for auth
- multer for multipart file uploads; sharp optional for image transforms
- Jest for server tests, React Testing Library for client unit tests, Playwright for E2E
- Docker + docker‑compose for containerized deployments
- systemd for host process management (unit templates provided)
- Tailscale (external network) — recommended network for remote access; app binds to configurable host IP

## Design Decisions

- Single host first: the codebase prioritizes familiarity and simplicity — easy local runs (scripts) and a simple systemd/Docker Compose deployment pattern. This accelerates development and testing.
- Storage adapter pattern: a small abstraction separates business logic from persistence so migrating to a DB or S3 later requires minimal changes.
- JWT for stateless auth: tokens keep the API stateless and easy to scale; RBAC is enforced server‑side to protect mutations.
- Static server selection: the `serve` tool had edge cases binding to non‑localhost addresses; a tiny `client/static-server.js` was added to reliably bind the frontend to a specific host/IP (useful when exposing on Tailscale).
- CI secrets: workflows are configured to accept `JWT_SECRET` from repository secrets. CI must use a strong secret — defaults are insecure and for local development only.
- Docker Compose uses `network_mode: host` by default to make hosting on Tailscale straightforward. This is a pragmatic choice for single‑host deployments; note the tradeoffs (host networking, port conflicts, security surface).

## Future Architecture Considerations

- Horizontal scaling: move persistence to a proper database (Postgres), use stateless API instances behind a reverse proxy/load balancer, and serve assets from a CDN.
- Media storage: shift uploads to S3 (or equivalent) and use signed URLs; this enables horizontal API scaling and cheaper storage management.
- Background workers: move cleanup, heavy image processing, and other async tasks to a worker queue (Redis + Bull/Sidekiq pattern) to avoid blocking web processes.
- Authentication hardening: rotate JWT keys, add refresh token strategy, integrate OAuth/SAML for enterprise use.
- Observability & security: add centralized logs, metrics (Prometheus), alerting, and automated vulnerability scanning; enable Playwright traces/screenshots on CI failures.
- Deployment: add Helm charts / Kubernetes manifests for cloud deployments; replace `network_mode: host` with explicit service networking for multi‑host clusters.

If you need a diagram or an expanded section for any of the above (storage migration plan, scaling checklist, or CI hardening steps) I can add it.
