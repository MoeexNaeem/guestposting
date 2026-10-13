#!/usr/bin/env bash
# Update the live site:  bash /www/wwwroot/guestposting/scripts/server/deploy.sh
#
# Pulls the latest code, builds into .next-build while the live site keeps
# serving .next, swaps the folders (a couple of seconds of restart), checks the
# site answers, and rolls back to the previous build if it doesn't.
set -euo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/guestposting}"
NAME=guestposting
PORT=3100

say()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\n\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mXX  %s\033[0m\n' "$*"; exit 1; }

cd "$APP_DIR"
[ -f .env ] || die "$APP_DIR/.env is missing. Run scripts/server/setup.sh first."

say "Getting the latest code"
lock_before=$(sha1sum package-lock.json 2>/dev/null | cut -d' ' -f1 || true)
git pull --ff-only
lock_after=$(sha1sum package-lock.json | cut -d' ' -f1)

if [ ! -d node_modules ] || [ "$lock_before" != "$lock_after" ]; then
  say "Installing packages"
  npm ci --include=dev --no-audit --no-fund
else
  say "Packages unchanged, skipping install"
fi

say "Building (the live site keeps running meanwhile)"
rm -rf .next-build
NEXT_DIST_DIR=.next-build NODE_ENV=production node node_modules/next/dist/bin/next build

for f in BUILD_ID required-server-files.json routes-manifest.json prerender-manifest.json; do
  [ -e ".next-build/$f" ] || die "Build is incomplete (missing $f). The live site was not touched."
done
[ -d .next-build/server ] || die "Build is incomplete (missing server/). The live site was not touched."

running() { pm2 describe "$NAME" >/dev/null 2>&1; }

healthy() {
  local i code
  for i in $(seq 1 45); do
    code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || true)
    [ "$code" = 200 ] && return 0
    sleep 2
  done
  return 1
}

start_app() {
  if running; then pm2 restart "$NAME" --update-env >/dev/null; else pm2 start ecosystem.config.cjs >/dev/null; fi
}

say "Switching to the new build"
running && pm2 stop "$NAME" >/dev/null
rm -rf .next-old
[ -d .next ] && mv -T .next .next-old
mv -T .next-build .next
start_app

if healthy; then
  pm2 save >/dev/null
  say "Done. The site is running the new version."
  exit 0
fi

warn "The new version did not answer. Last log lines:"
pm2 logs "$NAME" --lines 30 --nostream || true

if [ -d .next-old ]; then
  warn "Rolling back to the previous version"
  pm2 stop "$NAME" >/dev/null || true
  rm -rf .next-failed
  mv -T .next .next-failed
  mv -T .next-old .next
  start_app
  healthy && { pm2 save >/dev/null; die "Rolled back: the previous version is live again. The failed build is in .next-failed."; }
fi
die "The site is not answering. Check: pm2 logs $NAME"
