#!/usr/bin/env bash
# Safe, consistent SQLite backup (works while the site is running).
# Usage: bash backup.sh [label]     Keeps 14 days of backups.
set -euo pipefail

SITE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/clearcompare}"
KEEP_DAYS="${KEEP_DAYS:-14}"
LABEL="${1:-daily}"

DATABASE_URL="$(grep -E '^DATABASE_URL=' "$SITE_DIR/.env" | head -1 | cut -d= -f2- | tr -d '"'"'")"
DB_PATH="${DATABASE_URL#file:}"
[ -f "$DB_PATH" ] || { echo "$(date -Is) database not found at $DB_PATH"; exit 1; }

mkdir -p "$BACKUP_DIR"
OUT="$BACKUP_DIR/clearcompare-$(date +%Y%m%d-%H%M%S)-$LABEL.db"
sqlite3 "$DB_PATH" ".backup '$OUT'"
sqlite3 "$OUT" "PRAGMA integrity_check;" | grep -q '^ok$' || { echo "$(date -Is) integrity check FAILED for $OUT"; exit 1; }
gzip -f "$OUT"
find "$BACKUP_DIR" -name 'clearcompare-*.db.gz' -mtime +"$KEEP_DAYS" -delete
echo "$(date -Is) backup ok: $OUT.gz"
