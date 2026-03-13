# Project Architecture

## Overview

Custom Agent Builder Platform (CABP) is a minimal full‑stack application that lets users create and manage lightweight "agents" via a React single‑page app and a Node/Express HTTP API. The system is designed for rapid local development and simple deployment on a single host (via systemd or Docker Compose), with clear separation between API, frontend, storage, and media handling.

## Major Components

- API (server/) — Node.js + Express application exposing REST endpoints for auth, agent CRUD, media uploads, and health.
- Frontend (client/) — React 18 + Vite 8.0.0 SPA with modern UI architecture (Tailwind CSS 3.4, Framer Motion). Provides listing, creating, editing and deleting agents, login/account flows, and client‑side routing. Component-based architecture with UI primitives, layouts, and feature components. See `FRONTEND_ARCHITECTURE.md` for detailed frontend design.
- Storage adapters (server/src/storage/) — abstraction with in‑memory and file‑backed adapters so persistence strategy can be swapped without changing business logic.
- Media handling — multipart uploads via multer, optional image processing via sharp, static serving of upload artifacts, and a cleanup task/CLI that prunes old files.
- Auth & RBAC — JWT tokens issued at login, server‑side verification (`requireAuth`) and role checks (`requireRole`) enforce permissions; frontend decodes JWT for UX gating only.
- Dev & Ops helpers — dev start/stop scripts, a small static server to bind the built client to a specific host/IP, Dockerfiles + docker‑compose for containerized runs, and systemd unit templates for host provisioning.
- CI & E2E — GitHub Actions workflows for unit tests and Playwright E2E, with CI configured to obtain `JWT_SECRET` from repository secrets.
- Testing — Comprehensive automated testing with Jest (backend) and Vitest (frontend). See `TESTING.md` for testing guide.

## Data Flow

1. Client requests a page (SPA) from the static server (or Vite dev server). The SPA fetches data from API endpoints under `/api/*`.
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

**Backend:**
- Node.js (v20.x) and Express
- jsonwebtoken, bcryptjs for auth
- multer for multipart file uploads; sharp for image transforms
- Jest 30.3.0 for server tests
- Supertest 7.2.2 for API testing

**Frontend:**
- React 18 (functional components, hooks)
- Vite 8.0.0 (build tool)
- Tailwind CSS 3.4 (utility-first styling with custom design system)
- Framer Motion (animations and transitions)
- React Router v6 (client-side routing)
- Zustand (lightweight state management, available)
- Vitest 4.1.0 for unit tests
- React Testing Library 14.3.1 for component testing
- @testing-library/user-event for interaction testing

**Infrastructure:**
- Docker + docker‑compose for containerized deployments
- systemd for host process management (unit templates provided)
- Tailscale (external network) — recommended network for remote access; app binds to configurable host IP
- GitHub Actions (CI/CD)
- Playwright for E2E testing

## Design Decisions

**General:**
- Single host first: the codebase prioritizes familiarity and simplicity — easy local runs (scripts) and a simple systemd/Docker Compose deployment pattern. This accelerates development and testing.
- Storage adapter pattern: a small abstraction separates business logic from persistence so migrating to a DB or S3 later requires minimal changes.
- JWT for stateless auth: tokens keep the API stateless and easy to scale; RBAC is enforced server‑side to protect mutations.
- Static server selection: the `serve` tool had edge cases binding to non‑localhost addresses; a tiny `client/static-server.js` was added to reliably bind the frontend to a specific host/IP (useful when exposing on Tailscale).
- CI secrets: workflows are configured to accept `JWT_SECRET` from repository secrets. CI must use a strong secret — defaults are insecure and for local development only.
- Docker Compose uses `network_mode: host` by default to make hosting on Tailscale straightforward. This is a pragmatic choice for single‑host deployments; note the tradeoffs (host networking, port conflicts, security surface).

**Frontend:**
- Component-based architecture: UI primitives composed into layouts and features for consistency and reusability.
- Design system first: comprehensive design tokens (colors, typography, spacing, shadows) ensure visual consistency.
- Mobile-first responsive: all components designed for mobile, enhanced for desktop using Tailwind breakpoints.
- Accessibility first: semantic HTML, ARIA labels, keyboard navigation, visible focus states, WCAG AA/AAA color contrast.
- Performance optimization: Tailwind purges unused CSS, Vite tree-shakes JS, Framer Motion uses GPU-accelerated transforms.
- Atomic design pattern: components organized from primitives (Button, Card) to layouts (Header, Footer) to features (AgentCard, AgentDetail).
- **Navigation architecture (Phase 1):** Modular TopNavbar with composed components (NavLinks, SearchInput, UserMenu, MobileMenu) supporting desktop, tablet, and mobile responsive layouts.
- **Home section architecture (Phase 2):** Modular home sections (HeroSection, QuickStartSection, RecentAgentsSection, CapabilitiesSection, Footer) composed into HomePage. Real agent data integrated from API. Framer Motion animations with stagger effects. Authentication-aware content visibility.

**Testing:**
- Test-driven approach: comprehensive automated testing for both frontend and backend.
- Backend testing: Jest with Supertest for API endpoint testing, role-based permission testing, and integration tests.
- Frontend testing: Vitest with React Testing Library for component unit tests, user interaction testing, and integration tests.
- Test isolation: each test independent with proper setup/teardown, mocked external dependencies.
- Coverage targets: high coverage for critical paths (auth, CRUD operations, RBAC).
- CI integration: tests run automatically on pull requests and merges.

## Future Architecture Considerations

**Backend:**
- Horizontal scaling: move persistence to a proper database (Postgres), use stateless API instances behind a reverse proxy/load balancer, and serve assets from a CDN.
- Media storage: shift uploads to S3 (or equivalent) and use signed URLs; this enables horizontal API scaling and cheaper storage management.
- Background workers: move cleanup, heavy image processing, and other async tasks to a worker queue (Redis + Bull/Sidekiq pattern) to avoid blocking web processes.
- Authentication hardening: rotate JWT keys, add refresh token strategy, integrate OAuth/SAML for enterprise use.
- Observability & security: add centralized logs, metrics (Prometheus), alerting, and automated vulnerability scanning; enable Playwright traces/screenshots on CI failures.

**Frontend:**
- Dark mode: implement theme toggle using design tokens and Tailwind dark: variants.
- Advanced interactions: toast notifications, modal dialogs, dropdown menus, command palette.
- Search and filtering: full-text search with filters for skills, roles, creation date.
- Bulk operations: multi-select agents, bulk actions (delete, export).
- TypeScript migration: add type safety to components, hooks, and utilities.
- Testing expansion: unit tests for all components, integration tests, visual regression testing, E2E tests.
- Storybook: component playground and documentation.
- i18n: internationalization support for multiple languages.
- Progressive Web App: offline support, service workers, app manifest.

**Testing:**
- E2E test suite: comprehensive Playwright tests for critical user journeys.
- Visual regression: add screenshot comparison testing for UI consistency.
- Performance testing: add load testing and performance benchmarks.
- Contract testing: add API contract tests for frontend-backend interface.
- Mutation testing: verify test quality with mutation testing tools.

**Deployment:**
- Add Helm charts / Kubernetes manifests for cloud deployments; replace `network_mode: host` with explicit service networking for multi‑host clusters.
- Add nginx reverse proxy with TLS and HSTS for public exposure.
- Implement autoscaling based on load metrics.
- Add persistent analytics/usage dashboard (Prometheus/Grafana) and alerts.
