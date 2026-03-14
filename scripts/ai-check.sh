#!/usr/bin/env bash
set -euo pipefail

echo "== Basic environment check =="

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git not installed"
  exit 1
fi

if ! command -v ollama >/dev/null 2>&1; then
  echo "ERROR: ollama not installed"
  exit 1
fi

if ! command -v aider >/dev/null 2>&1; then
  echo "ERROR: aider not installed"
  exit 1
fi

echo
echo "== NVIDIA check =="
if command -v nvidia-smi >/dev/null 2>&1; then
  nvidia-smi || true
else
  echo "WARNING: nvidia-smi not found"
fi

echo
echo "== Ollama check =="
ollama -v || true

echo
echo "== Repo check =="
git rev-parse --show-toplevel

echo
echo "All basic checks completed."
