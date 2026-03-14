#!/usr/bin/env bash
set -euo pipefail

cd ~/Repo1

export OLLAMA_API_BASE="${OLLAMA_API_BASE:-http://127.0.0.1:11434}"

echo "Using repo: $(pwd)"
echo "Using Ollama endpoint: ${OLLAMA_API_BASE}"

exec aider --model ollama_chat/qwen2.5-coder:14b
