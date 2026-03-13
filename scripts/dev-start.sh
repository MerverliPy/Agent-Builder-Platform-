#!/usr/bin/env bash
set -euo pipefail

# Start the server and serve the built client so the app is reachable on a LAN/Tailscale IP.
# Usage: ./scripts/dev-start.sh [TAILSCALE_IP]
# If no IP is provided the script uses 100.81.83.98

TS_IP="${1:-100.81.83.98}"
JWT_SECRET="${JWT_SECRET:-dev-secret}"

echo "Starting CABP server bound to ${TS_IP} (JWT_SECRET ${JWT_SECRET:+(provided)})"

# Start server
echo "Installing server deps..."
cd server
npm ci
echo "Starting server (logs -> /tmp/cabp-server.log)"
# server listens on HOST env var (server reads process.env.HOST)
HOST="$TS_IP" JWT_SECRET="$JWT_SECRET" npm start &> /tmp/cabp-server.log &
echo $! > /tmp/cabp-server.pid
cd - > /dev/null

echo "Waiting for server to be available at http://${TS_IP}:5000..."
npx wait-on "http://${TS_IP}:5000" --timeout 30000

# Build and serve client
echo "Installing client deps and building..."
cd client
npm ci
npm run build
echo "Serving client build on port 3000 (logs -> /tmp/cabp-client.log)"
npx serve -s dist -l 3000 &> /tmp/cabp-client.log &
echo $! > /tmp/cabp-client.pid
cd - > /dev/null

echo "Waiting for client to be available at http://${TS_IP}:3000..."
npx wait-on "http://${TS_IP}:3000" --timeout 30000

echo "Started."
echo "  Server: http://${TS_IP}:5000"
echo "  Client: http://${TS_IP}:3000"
echo "To stop: ./scripts/dev-stop.sh"
