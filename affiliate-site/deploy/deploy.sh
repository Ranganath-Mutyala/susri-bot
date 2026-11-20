#!/usr/bin/env bash
# Build and (re)start the site. Run as the app user from anywhere:
#   bash /var/www/clearcompare/affiliate-site/deploy/deploy.sh          # pull latest code + deploy
#   bash .../deploy.sh --no-pull                                        # deploy current files
# Safe to run repeatedly. Database migrations and seeding never delete your content.
set -euo pipefail

SITE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SITE_DIR"

[ "$(id -u)" -ne 0 ] || { echo "Run as the app user, not root:  sudo -u app bash $0"; exit 1; }
[ -f .env ] || { echo "Missing $SITE_DIR/.env — copy .env.production.example to .env and fill it in."; exit 1; }

# Load .env so we can validate it
set -a; . ./.env; set +a
fail=0
for v in DATABASE_URL ADMIN_EMAIL ADMIN_PASSWORD AUTH_SECRET NEXT_PUBLIC_SITE_URL; do
  [ -n "${!v:-}" ] || { echo "ERROR: $v is empty in .env"; fail=1; }
done
case "${AUTH_SECRET:-}" in *replace-with*|"") echo "ERROR: set a random AUTH_SECRET (openssl rand -base64 32)"; fail=1;; esac
case "${ADMIN_PASSWORD:-}" in *change-me*) echo "ERROR: change ADMIN_PASSWORD"; fail=1;; esac
[ "${#ADMIN_PASSWORD}" -ge 12 ] || { echo "ERROR: ADMIN_PASSWORD must be at least 12 characters"; fail=1; }
case "${NEXT_PUBLIC_SITE_URL:-}" in https://*) ;; *) echo "WARNING: NEXT_PUBLIC_SITE_URL should be your https:// domain";; esac
[ "$fail" -eq 0 ] || exit 1

DB_PATH="${DATABASE_URL#file:}"
case "$DB_PATH" in /*) ;; *) echo "ERROR: in production use an absolute DATABASE_URL, e.g. file:/var/lib/clearcompare/prod.db"; exit 1;; esac
mkdir -p "$(dirname "$DB_PATH")"

if [ "${1:-}" != "--no-pull" ] && [ -d "$SITE_DIR/../.git" ]; then
  echo "==> Pulling latest code"
  git -C "$SITE_DIR/.." pull --ff-only
fi

if [ -f "$DB_PATH" ] && command -v sqlite3 >/dev/null; then
  echo "==> Backing up database before deploy"
  bash "$SITE_DIR/deploy/backup.sh" pre-deploy
fi

if [ -f "$DB_PATH" ] && command -v sqlite3 >/dev/null; then
  # Keep SQLite in its default journal mode; WAL makes Prisma migrations fail while the app is running.
  sqlite3 "$DB_PATH" "PRAGMA journal_mode=DELETE;" >/dev/null 2>&1 || true
fi

echo "==> Installing dependencies"
npm ci --no-audit --no-fund

echo "==> Applying database migrations"
npx prisma migrate deploy

echo "==> Seeding starter content (skips anything that already exists)"
npx prisma db seed

echo "==> Building"
npm run build

echo "==> Starting / reloading app"
pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save >/dev/null

echo "==> Health check"
for i in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
    echo "Deploy complete — site is healthy."
    exit 0
  fi
  sleep 2
done
echo "Health check failed. Inspect logs with:  pm2 logs clearcompare --lines 100"
exit 1
