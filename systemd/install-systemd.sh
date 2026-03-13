#!/usr/bin/env bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "This script requires sudo/root. Run as root or with sudo."
  exit 1
fi

WORKDIR="/home/calvin/Repo1"
ENV_FILE="/etc/cabp.env"

echo "=== CABP Systemd Installation ==="
echo ""

# Check if /etc/cabp.env exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Creating /etc/cabp.env (you should edit it to set JWT_SECRET)"
  cat > "$ENV_FILE" <<'EOF'
# CABP environment
JWT_SECRET=replace-with-strong-secret
HOST=100.81.83.98
PORT=3000
NODE_ENV=production
EOF
  chmod 600 "$ENV_FILE"
  echo "✓ Created $ENV_FILE"
else
  echo "✓ $ENV_FILE already exists (keeping existing config)"
fi

echo ""
echo "Copying systemd unit files..."
SERVER_UNIT="/etc/systemd/system/cabp-server.service"
CLIENT_UNIT="/etc/systemd/system/cabp-client.service"

# Replace REPLACE_USER in unit files with the current non-root user owning the WORKDIR
OWNER_USER=$(stat -c '%U' "$WORKDIR")
echo "Detected owner user: $OWNER_USER"

sed "s|REPLACE_USER|$OWNER_USER|g" "$WORKDIR/systemd/cabp-server.service" > "$SERVER_UNIT"
sed "s|REPLACE_USER|$OWNER_USER|g" "$WORKDIR/systemd/cabp-client.service" > "$CLIENT_UNIT"
chmod 644 "$SERVER_UNIT" "$CLIENT_UNIT"

# Try to detect the node binary available to the owning user (useful when node is managed by nvm)
USER_NODE=""
if USER_NODE=$(su - "$OWNER_USER" -c 'command -v node' 2>/dev/null || true); then
  USER_NODE=$(echo "$USER_NODE" | tr -d '\n' || true)
fi
if [ -n "$USER_NODE" ]; then
  echo "Detected node for $OWNER_USER at: $USER_NODE"
  # If node is not in a common global location, pin ExecStart to the absolute path
  case "$USER_NODE" in
    /usr/bin/*|/usr/local/bin/*)
      echo "Node is in a system location; leaving unit ExecStart to use /usr/bin/env node"
      ;;
    *)
      echo "Pinning ExecStart to $USER_NODE in unit files to ensure systemd can find node"
      sed -i "s|/usr/bin/env node|$USER_NODE|g" "$SERVER_UNIT" "$CLIENT_UNIT" || true
      ;;
  esac
else
  echo "No node binary found for user $OWNER_USER. Systemd units will use '/usr/bin/env node'."
  echo "If you use nvm, ensure the node path is added to the unit or install node globally."
fi

echo ""
echo "Stopping any running processes on ports 3000 and 5000..."
# Kill any existing processes
pkill -f "serve -s" || true
pkill -f "static-server.js" || true
# Wait a moment for processes to stop
sleep 2

echo ""
echo "Reloading systemd daemon..."
systemctl daemon-reload

echo ""
echo "Stopping any existing services..."
systemctl stop cabp-server.service 2>/dev/null || true
systemctl stop cabp-client.service 2>/dev/null || true

echo ""
echo "Enabling and starting services..."
systemctl enable cabp-server.service
systemctl enable cabp-client.service
systemctl start cabp-server.service
systemctl start cabp-client.service

echo ""
echo "=== Service Status ==="
echo ""
echo "--- Backend Server ---"
systemctl status cabp-server.service --no-pager || true
echo ""
echo "--- Frontend Client ---"
systemctl status cabp-client.service --no-pager || true

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Logs available at:"
echo "  - Backend:  /var/log/cabp-server.log"
echo "  - Frontend: /var/log/cabp-client.log"
echo ""
echo "Service commands:"
echo "  sudo systemctl status cabp-server"
echo "  sudo systemctl status cabp-client"
echo "  sudo systemctl restart cabp-server"
echo "  sudo systemctl restart cabp-client"
echo "  sudo journalctl -u cabp-server -f"
echo "  sudo journalctl -u cabp-client -f"
echo ""
echo "Frontend: http://100.81.83.98:3000"
echo "Backend:  http://localhost:5000"
