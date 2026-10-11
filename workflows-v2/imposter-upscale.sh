#!/bin/bash
# IMPOSTER — auto upscale to print resolution using Upscayl's bundled Real-ESRGAN.
# Usage: imposter-upscale.sh <input-image> <A3|A4> <output.png> [normal|max]
#   normal: images below 300 DPI are enlarged to 300 DPI (A3 3508px wide, A4 2480px).
#   max   : images below 300 DPI are enlarged to 400 DPI (A3 4677px, A4 3307px) and, when the
#           source is small (<2 MP), Upscayl's TTA mode (8 passes, best quality, ~7x slower) is used.
#           Images already >= 300 DPI are kept untouched (never degraded).
# Prints ONE json line: {"status":"OK|SKIPPED|ERROR","w":..,"h":..,"scale":..,"note":".."}
# Never distorts or crops: image is only enlarged so it covers the print size.
IN="$1"; SIZE="$2"; OUT="$3"; MODE="${4:-normal}"
UPSCAYL="${UPSCAYL_DIR:-/Applications/Upscayl.app/Contents/Resources}"
MODEL="${UPSCAYL_MODEL:-high-fidelity-4x}"
case "$SIZE" in A3) TS=3508; TL=4961; MS=4677; ML=6614;; A4) TS=2480; TL=3508; MS=3307; ML=4677;; *) echo '{"status":"ERROR","note":"size must be A3 or A4"}'; exit 0;; esac
err(){ echo "{\"status\":\"ERROR\",\"note\":\"$1\"}"; exit 0; }
[ -f "$IN" ] || err "input missing"
WORK="$(mktemp -d /tmp/imposter.XXXXXX)"
# one upscale at a time (GPU): simple lock, waits up to 3 h, steals a stale lock (>6 h)
LOCK=/tmp/imposter-upscale.lock
for i in $(seq 1 5400); do mkdir "$LOCK" 2>/dev/null && break; [ -n "$(find "$LOCK" -mmin +360 2>/dev/null)" ] && rmdir "$LOCK" 2>/dev/null; sleep 2; done
trap 'rm -rf "$WORK"; rmdir "$LOCK" 2>/dev/null' EXIT
# 1. normalise any format (jpg/png/heic/webp/pdf first page) to PNG
sips -s format png "$IN" --out "$WORK/src.png" >/dev/null 2>&1 || err "cannot read image"
W=$(sips -g pixelWidth  "$WORK/src.png" | awk '/pixelWidth/{print $2}')
H=$(sips -g pixelHeight "$WORK/src.png" | awk '/pixelHeight/{print $2}')
[ -n "$W" ] && [ -n "$H" ] || err "cannot read size"
# 2. orientation-aware targets (short side S, long side L)
if [ "$H" -ge "$W" ]; then TW=$TS; TH=$TL; MW=$MS; MH=$ML; else TW=$TL; TH=$TS; MW=$ML; MH=$MS; fi
ASPECT=$(awk -v w=$W -v h=$H 'BEGIN{r=(h>w)?h/w:w/h; d=(r-1.4142)/1.4142; if(d<0)d=-d; print (d>0.08)?"ASPECT_OFF":"ok"}')
# 3. enlargement needed to reach 300 DPI (the "good enough" line) ...
F300=$(awk -v w=$W -v h=$H -v tw=$TW -v th=$TH 'BEGIN{a=tw/w;b=th/h;print (a>b)?a:b}')
NEED=$(awk -v f=$F300 'BEGIN{print (f>1.02)?1:0}')
if [ "$NEED" -eq 0 ]; then
  cp "$WORK/src.png" "$OUT"
  echo "{\"status\":\"SKIPPED\",\"w\":$W,\"h\":$H,\"scale\":1,\"note\":\"already print resolution;$ASPECT\"}"; exit 0
fi
# ... and the real target: 300 DPI (normal) or 400 DPI (max)
if [ "$MODE" = "max" ]; then GW=$MW; GH=$MH; else GW=$TW; GH=$TH; fi
F=$(awk -v w=$W -v h=$H -v tw=$GW -v th=$GH 'BEGIN{a=tw/w;b=th/h;print (a>b)?a:b}')
TARGET_W=$(awk -v w=$W -v f=$F 'BEGIN{printf "%d", w*f+0.5}')
if   awk -v f=$F 'BEGIN{exit !(f<=2)}'; then S=2
elif awk -v f=$F 'BEGIN{exit !(f<=3)}'; then S=3
else S=4; fi
TTA=""; if [ "$MODE" = "max" ] && [ $((W*H)) -lt 2000000 ]; then TTA="-x"; fi
# 4. AI upscale (TTA in max mode for small sources), then land exactly on the print size
"$UPSCAYL/bin/upscayl-bin" -i "$WORK/src.png" -o "$WORK/up.png" -m "$UPSCAYL/models" -n "$MODEL" -z 4 -s $S $TTA -f png >/dev/null 2>&1
[ -s "$WORK/up.png" ] || err "upscayl failed"
UW=$(sips -g pixelWidth "$WORK/up.png" | awk '/pixelWidth/{print $2}')
# very small sources: a single 4x pass is not enough -> second AI pass (no TTA, image is bigger now)
if [ "$UW" -lt $((TARGET_W*98/100)) ]; then
  F2=$(awk -v u=$UW -v t=$TARGET_W 'BEGIN{printf "%.4f", t/u}')
  if   awk -v f=$F2 'BEGIN{exit !(f<=2)}'; then S2=2; elif awk -v f=$F2 'BEGIN{exit !(f<=3)}'; then S2=3; else S2=4; fi
  "$UPSCAYL/bin/upscayl-bin" -i "$WORK/up.png" -o "$WORK/up2.png" -m "$UPSCAYL/models" -n "$MODEL" -z 4 -s $S2 -f png >/dev/null 2>&1
  [ -s "$WORK/up2.png" ] && mv "$WORK/up2.png" "$WORK/up.png" && S="$S+$S2"
  UW=$(sips -g pixelWidth "$WORK/up.png" | awk '/pixelWidth/{print $2}')
fi
if [ "$UW" -ne "$TARGET_W" ]; then sips --resampleWidth $TARGET_W "$WORK/up.png" >/dev/null 2>&1; fi
cp "$WORK/up.png" "$OUT"
FW=$(sips -g pixelWidth "$OUT" | awk '/pixelWidth/{print $2}'); FH=$(sips -g pixelHeight "$OUT" | awk '/pixelHeight/{print $2}')
echo "{\"status\":\"OK\",\"w\":$FW,\"h\":$FH,\"scale\":\"$S\",\"note\":\"from ${W}x${H} mode=$MODE${TTA:+ tta};$ASPECT\"}"
