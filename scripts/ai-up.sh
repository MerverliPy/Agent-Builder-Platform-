#!/usr/bin/env bash
set -euo pipefail

export OLLAMA_HOST=0.0.0.0:11434
export OLLAMA_CONTEXT_LENGTH=8192

echo "Starting Ollama on ${OLLAMA_HOST} with context ${OLLAMA_CONTEXT_LENGTH}"
exec ollama serve
