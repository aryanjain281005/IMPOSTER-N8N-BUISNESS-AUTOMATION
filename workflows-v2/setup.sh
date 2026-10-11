#!/bin/bash
# IMPOSTER auto-upscale — one-time setup (run once on the Mac that runs n8n)
set -e
DIR="$HOME/.n8n-files/imposter"
mkdir -p "$DIR/work"
cp "$(dirname "$0")/imposter-upscale.sh" "$DIR/imposter-upscale.sh"
chmod +x "$DIR/imposter-upscale.sh"
[ -x /Applications/Upscayl.app/Contents/Resources/bin/upscayl-bin ] || { echo "Upscayl.app not found in /Applications"; exit 1; }
echo "Installed to $DIR"
echo
echo "Now start n8n with the Execute Command node enabled, e.g.:"
echo "  NODES_EXCLUDE='[]' n8n start"
echo "(n8n 2.x blocks the Execute Command node by default.)"
