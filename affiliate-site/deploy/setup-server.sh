#!/usr/bin/env bash
# One-time server preparation for Ubuntu 22.04 / 24.04.
# Run as root:   sudo bash setup-server.sh
# Installs Node.js 22, PM2, Nginx, SQLite CLI, firewall, swap, app user,
# data/backup folders, PM2 auto-start and a daily database backup.
set -euo pipefail

APP_USER="app"
APP_DIR="/var/www/clearcompare"          # the git clone goes here
DATA_DIR="/var/lib/clearcompare"         # SQLite database lives here (outside the code)
BACKUP_DIR="/var/backups/clearcompare"

[ "$(id -u)" -eq 0 ] || { echo "Please run as root (sudo bash $0)"; exit 1; }

echo "==> Updating system packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git nginx sqlite3 ufw ca-certificates gnupg

echo "==> Installing Node.js 22"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v
npm install -g pm2

echo "==> Adding 2 GB swap (helps the build on small 1–2 GB servers)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Creating user '$APP_USER' and folders"
id "$APP_USER" >/dev/null 2>&1 || adduser --disabled-password --gecos "" "$APP_USER"
mkdir -p "$APP_DIR" "$DATA_DIR" "$BACKUP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR" "$DATA_DIR" "$BACKUP_DIR"
chmod 750 "$DATA_DIR" "$BACKUP_DIR"

echo "==> Firewall: allow SSH + HTTP/HTTPS only"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> PM2 auto-start on reboot"
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" >/dev/null

echo "==> Daily database backup at 03:15 (keeps 14 days)"
cat > /etc/cron.d/clearcompare-backup <<CRON
15 3 * * * $APP_USER $APP_DIR/affiliate-site/deploy/backup.sh >> $BACKUP_DIR/backup.log 2>&1
CRON
chmod 644 /etc/cron.d/clearcompare-backup

rm -f /etc/nginx/sites-enabled/default
systemctl reload nginx || true

cat <<DONE

Server is ready. Next steps (see affiliate-site/deploy/DEPLOY.md):
  1. sudo -u $APP_USER git clone <your-repo-url> $APP_DIR
  2. sudo -u $APP_USER cp $APP_DIR/affiliate-site/.env.production.example $APP_DIR/affiliate-site/.env  (then edit it)
  3. sudo -u $APP_USER bash $APP_DIR/affiliate-site/deploy/deploy.sh
  4. Save the Cloudflare Origin Certificate, then: sudo bash $APP_DIR/affiliate-site/deploy/install-nginx.sh yourdomain.com
DONE
