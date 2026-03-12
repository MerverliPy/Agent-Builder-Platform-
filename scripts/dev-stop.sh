#!/usr/bin/env bash
set -euo pipefail

echo "Stopping CABP background processes (if any)"
if [ -f /tmp/cabp-client.pid ]; then
  kill $(cat /tmp/cabp-client.pid) || true
  rm -f /tmp/cabp-client.pid
  echo "Stopped client"
fi
if [ -f /tmp/cabp-server.pid ]; then
  kill $(cat /tmp/cabp-server.pid) || true
  rm -f /tmp/cabp-server.pid
  echo "Stopped server"
fi
