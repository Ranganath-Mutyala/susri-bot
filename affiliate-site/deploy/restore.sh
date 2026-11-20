#!/usr/bin/env bash
# Restore the database from a backup file.
# Usage: bash restore.sh /var/backups/clearcompare/clearcompare-YYYYMMDD-HHMMSS-daily.db.gz
set -euo pipefail

SRC="${1:-}"
[ -f "$SRC" ] || { echo "Usage: bash $0 <backup.db.gz>"; ls -1t /var/backups/clearcompare/*.db.gz 2>/dev/null | head; exit 1; }
SITE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATABASE_URL="$(grep -E '^DATABASE_URL=' "$SITE_DIR/.env" | head -1 | cut -d= -f2- | tr -d '"'"'")"
DB_PATH="${DATABASE_URL#file:}"

read -r -p "This replaces $DB_PATH with $SRC. Continue? [y/N] " ok
[ "$ok" = "y" ] || exit 1

bash "$SITE_DIR/deploy/backup.sh" pre-restore || true
pm2 stop clearcompare || true
TMP="$(mktemp)"
gunzip -c "$SRC" > "$TMP"
sqlite3 "$TMP" "PRAGMA integrity_check;" | grep -q '^ok$' || { echo "Backup file is corrupt"; rm -f "$TMP"; exit 1; }
sqlite3 "$TMP" "PRAGMA journal_mode=DELETE;" >/dev/null   # default journal mode (WAL blocks migrations while running)
rm -f "$DB_PATH-wal" "$DB_PATH-shm"
mv "$TMP" "$DB_PATH"
chmod 640 "$DB_PATH"
pm2 start clearcompare
echo "Restored. A copy of the previous database was saved as a 'pre-restore' backup."
