#!/usr/bin/env bash
set -euo pipefail

cd ~/Repo1

echo "== git status =="
git status --short || true

if [ -f package.json ]; then
  echo "== npm install =="
  npm install

  echo "== build =="
  npm run build || true

  echo "== lint =="
  npm run lint || true

  echo "== typecheck =="
  npm run typecheck || true

  echo "== test =="
  npm test || true
else
  echo "No package.json at repo root. Adjust scripts/validate.sh for this repo."
fi
