#!/usr/bin/env bash
# Configures Nginx for your domain behind Cloudflare (SSL mode: Full (strict)).
# Usage: sudo bash install-nginx.sh yourdomain.com
set -euo pipefail

DOMAIN="${1:-}"
[ -n "$DOMAIN" ] || { echo "Usage: sudo bash $0 yourdomain.com"; exit 1; }
[ "$(id -u)" -eq 0 ] || { echo "Please run as root"; exit 1; }
DOMAIN="${DOMAIN#www.}"

CERT=/etc/ssl/cloudflare/origin.pem
KEY=/etc/ssl/cloudflare/origin.key
if [ ! -s "$CERT" ] || [ ! -s "$KEY" ]; then
  cat <<MSG
Cloudflare Origin Certificate not found.
In Cloudflare: SSL/TLS -> Origin Server -> Create Certificate (RSA, hostnames: $DOMAIN and *.$DOMAIN, 15 years).
Then on this server:
  sudo mkdir -p /etc/ssl/cloudflare
  sudo nano $CERT     # paste the "Origin Certificate"
  sudo nano $KEY      # paste the "Private Key"
  sudo chmod 600 $KEY
and run this script again.
MSG
  exit 1
fi
chmod 600 "$KEY"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
sed "s/YOUR_DOMAIN/$DOMAIN/g" "$SCRIPT_DIR/nginx/clearcompare.conf" > /etc/nginx/sites-available/clearcompare.conf
# Some VPS images have IPv6 disabled; drop the [::] listeners there.
if [ ! -s /proc/net/if_inet6 ]; then
  sed -i '/listen \[::\]/d' /etc/nginx/sites-available/clearcompare.conf
fi
ln -sf /etc/nginx/sites-available/clearcompare.conf /etc/nginx/sites-enabled/clearcompare.conf
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx 2>/dev/null || nginx -s reload
echo "Nginx configured for $DOMAIN (www.$DOMAIN redirects to $DOMAIN)."
