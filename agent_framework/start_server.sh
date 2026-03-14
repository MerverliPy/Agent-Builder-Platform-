#!/bin/bash
# Start the Qwen Agent OpenAI Bridge server
# This makes Qwen available as an OpenAI-compatible provider for OpenCode

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Activate venv if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Default settings
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8787}"
MODEL="${QWEN_MODEL:-qwen2.5-coder:14b}"

echo "Starting Qwen Agent Bridge..."
echo "  Host: $HOST"
echo "  Port: $PORT"
echo "  Model: $MODEL"
echo ""
echo "Configure OpenCode with:"
echo '  "provider": {'
echo '    "qwen-agent": {'
echo '      "npm": "@ai-sdk/openai-compatible",'
echo '      "name": "Qwen Agent (local)",'
echo '      "options": {'
echo "        \"baseURL\": \"http://$HOST:$PORT/v1\""
echo '      },'
echo '      "models": {'
echo "        \"$MODEL\": {"
echo '          "name": "Qwen 2.5 Coder 14B"'
echo '        }'
echo '      }'
echo '    }'
echo '  }'
echo ""

python server/api.py --host "$HOST" --port "$PORT" --model "$MODEL"
