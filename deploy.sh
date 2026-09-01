#!/usr/bin/env bash
# Stamp a fresh build into sw.js, commit and push.
set -euo pipefail
cd "$(dirname "$0")"
MSG="${1:-Update catalogue}"
STAMP=$(date -u +%Y%m%d-%H%M%S)
sed -i "s/^const BUILD = '.*';/const BUILD = '$STAMP';/" sw.js
git add -A
git commit -m "$MSG (build $STAMP)"
git push origin main
echo "Pushed build $STAMP. GitHub Pages usually republishes within a minute."
