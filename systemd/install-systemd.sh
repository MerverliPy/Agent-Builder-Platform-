#!/usr/bin/env bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "This script requires sudo/root. Run as root or with sudo."
  exit 1
fi

WORKDIR="/home/calvin/Repo1"
ENV_FILE="/etc/cabp.env"

echo "Creating /etc/cabp.env (you should edit it to set JWT_SECRET)"
cat > "$ENV_FILE" <<'EOF'
# CABP environment
JWT_SECRET=replace-with-strong-secret
HOST=0.0.0.0
PORT=3000
EOF
chmod 600 "$ENV_FILE"

echo "Copying systemd unit files"
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
      echo "Pinning ExecStart to "$USER_NODE" in unit files to ensure systemd can find node"
      sed -i "s|/usr/bin/env node|$USER_NODE|g" "$SERVER_UNIT" "$CLIENT_UNIT" || true
      ;;
  esac
else
  echo "No node binary found for user $OWNER_USER. Systemd units will use '/usr/bin/env node'."
  echo "If you use nvm, ensure the node path is added to the unit or install node globally."
fi

echo "Reloading systemd"
systemctl daemon-reload

echo "Enabling and starting services"
systemctl enable --now cabp-server.service || true
systemctl enable --now cabp-client.service || true

echo "Status (server):"
systemctl status cabp-server.service --no-pager
echo "Status (client):"
systemctl status cabp-client.service --no-pager

echo "Logs: /var/log/cabp-server.log and /var/log/cabp-client.log"
