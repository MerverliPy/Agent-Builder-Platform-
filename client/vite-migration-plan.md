Vite migration plan — cabp-client

Goal
- Migrate the client from Create React App (`react-scripts`) to Vite (modern, fast, smaller deps) to eliminate transitive vulnerabilities and improve dev/build performance.

High-level steps
1) Create branch `migrate/client-to-vite` from main
2) Install Vite + React plugin
   - cd client
   - npm install --save-dev vite @vitejs/plugin-react
3) Replace scripts in `client/package.json`:
   - `start` -> `vite`
   - `build` -> `vite build`
   - `test` remains `react-scripts test` temporarily or move to `vitest` later
   - `serve-build` -> `vite preview` (or keep `serve`)
4) Add `index.html` at client root matching Vite format (move root div here and ensure env vars mapping)
5) Update imports that rely on CRA-specific features (e.g., %PUBLIC_URL%, process.env.PUBLIC_URL) to Vite envs (import.meta.env)
6) Ensure CSS and static assets keep working (Vite handles imports from `/src` by default)
7) Update tests: keep jest for now or migrate to Vitest (recommended after migration)
8) `npm run build` should produce `dist/` (Vite default). Update dockerfile/cicd to use `dist` if needed.
9) Run full CI (npm ci, tests, build). Fix regressions.

Notes & Risks
- Migration requires manual adjustments for env variables and any CRA-specific config (service worker/workbox, PWA setups). Workbox-related deps can be dropped or reconfigured with Vite plugins.
- Tests may require migration to a Vite-compatible runner (Vitest + jsdom) later; for quick migration keep jest but ensure `npm test` still works.
- This is medium-effort but gives long-term maintenance benefits and eliminates many transitive vulnerabilities tied to `react-scripts`.

Quick commands to scaffold and verify
- git checkout -b migrate/client-to-vite
- cd client
- npm install --save-dev vite @vitejs/plugin-react
- Modify `package.json` scripts and add `index.html`
- npm run build
- npm test

If you want, I can start the migration branch and apply the minimal scaffolding changes (package.json scripts, index.html, vite config) and run `npm run build` and unit tests here; say `start migration` and I'll proceed.
