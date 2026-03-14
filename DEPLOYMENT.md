# CABP Deployment Guide

## Quick Start - Systemd Installation

To set up CABP as a permanent systemd service, run:

```bash
sudo systemd/install-systemd.sh
```

This will:
1. Create `/etc/cabp.env` with default environment variables
2. Install systemd service units for both frontend and backend
3. Detect and configure the correct Node.js path
4. Stop any existing processes on ports 3000 and 5000
5. Enable and start both services
6. Display service status

## Service Management

### Check Status
```bash
sudo systemctl status cabp-server   # Backend API
sudo systemctl status cabp-client   # Frontend
```

### Restart Services
```bash
sudo systemctl restart cabp-server  # Restart backend
sudo systemctl restart cabp-client  # Restart frontend
```

### View Logs
```bash
# Live logs
sudo journalctl -u cabp-server -f
sudo journalctl -u cabp-client -f

# Log files
tail -f /var/log/cabp-server.log
tail -f /var/log/cabp-client.log
```

### Stop Services
```bash
sudo systemctl stop cabp-server
sudo systemctl stop cabp-client
```

### Disable Auto-Start
```bash
sudo systemctl disable cabp-server
sudo systemctl disable cabp-client
```

## Deploying Updates

After making changes to the code:

```bash
# Pull latest changes
git pull origin main

# Rebuild client (if frontend changed)
cd client
npm run build
cd ..

# Restart services to pick up changes
sudo systemctl restart cabp-server
sudo systemctl restart cabp-client
```

## Environment Configuration

Edit `/etc/cabp.env` to configure:

```bash
sudo nano /etc/cabp.env
```

**Important:** Change `JWT_SECRET` from the default value!

```env
# CABP environment
JWT_SECRET=your-very-strong-secret-key-here
HOST=100.81.83.98
PORT=3000
NODE_ENV=production
```

After editing, restart services:
```bash
sudo systemctl restart cabp-server
sudo systemctl restart cabp-client
```

## Architecture

### Frontend (cabp-client.service)
- **Process:** `static-server.js` serving the Vite build
- **Directory:** `/home/calvin/Repo1/client/dist`
- **Port:** 3000
- **URL:** http://100.81.83.98:3000

### Backend (cabp-server.service)
- **Process:** Express.js API server
- **Directory:** `/home/calvin/Repo1/server`
- **Port:** 5000 (internal)
- **API:** http://localhost:5000/api

## Troubleshooting

### Service won't start
```bash
# Check detailed logs
sudo journalctl -u cabp-server -n 50 --no-pager
sudo journalctl -u cabp-client -n 50 --no-pager

# Check if ports are in use
sudo lsof -i :3000
sudo lsof -i :5000

# Verify node path
which node
```

### Frontend shows old UI
```bash
# Rebuild the client
cd /home/calvin/Repo1/client
npm run build

# Restart frontend service
sudo systemctl restart cabp-client
```

### Database connection issues
```bash
# Check server logs
sudo journalctl -u cabp-server -n 100 --no-pager

# Verify database file exists
ls -la /home/calvin/Repo1/server/cabp.db
```

## Manual Process Management (Alternative)

If you prefer not to use systemd, you can run processes manually:

```bash
# Terminal 1 - Backend
cd /home/calvin/Repo1/server
node src/index.js

# Terminal 2 - Frontend  
cd /home/calvin/Repo1/client
HOST=100.81.83.98 PORT=3000 node static-server.js
```

Or use PM2:
```bash
npm install -g pm2
pm2 start server/src/index.js --name cabp-server
pm2 start client/static-server.js --name cabp-client -- HOST=100.81.83.98 PORT=3000
pm2 save
pm2 startup  # Enable on boot
```

## URLs

- **Application:** http://100.81.83.98:3000
- **API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/agents

## Security Notes

1. **JWT Secret:** Change the default `JWT_SECRET` in `/etc/cabp.env`
2. **Firewall:** Ensure port 3000 is accessible via Tailscale
3. **File Permissions:** `/etc/cabp.env` is set to 600 (owner read/write only)
4. **Service User:** Services run as the `calvin` user (not root)

## Next Steps After Installation

1. ✓ Services installed and running
2. ☐ Change JWT_SECRET in `/etc/cabp.env` (CRITICAL: use a strong random secret)
3. ☐ Test application at http://100.81.83.98:3000
4. ☐ Create initial admin user via `/api/auth/register` endpoint (first user automatically becomes admin)
5. ☐ Configure backup strategy for database

## Creating the Initial Admin User

To create your first admin user:

```bash
curl -X POST http://100.81.83.98:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-strong-password"
  }'
```

The first user to register automatically receives the `admin` role. Subsequent users will be created with the `editor` role by default and can be promoted to admin via the `/api/admin/users/:id/role` endpoint.
