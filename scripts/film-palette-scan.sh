#!/usr/bin/env bash
# Shumi study film — palette & typography drift scanner.
# Scans v2/site/ep*/index.html for color/font usage vs the brand canon
# and emits a drift report. Read-only.
#
# Usage: scripts/film-palette-scan.sh [report|raw]
#   report  (default) — annotated drift table
#   raw            — unannotated dump (for diffing across runs)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FILMS=( "$ROOT/v2/site/ep1/index.html" "$ROOT/v2/site/ep2/index.html" "$ROOT/v2/site/ep3/index.html" )
MODE="${1:-report}"

# Canonical palette (lowercase). Anything outside this set is drift,
# unless it appears in QUOTED_UI_COLORS, in which case it's flagged
# as quoted-UI (allowed by exception when contained in a citation
# region — see CANON.md).
CANON_COLORS=(
  "#d4574a"  # terracotta — primary editorial
  "#ef4444"  # failure red
  "#d4a843"  # warning gold
  "#4ade80"  # success green
  "#999999"  # axis/caption gray
  "#e0e0e0"  # text on dark
  "#0a0a0a"  # surface
  "#e74c3c"  # logo red — bloom + wordmark only
)

# Surface ladder — accepted as canon-by-exception (CANON.md "Surface
# ladder"). Three tones, no finer steps.
SURFACE_LADDER=(
  "#141414"  # panel
  "#1e1e22"  # nested element
)

# Quoted UI — foreign palettes allowed inside contained citation
# regions. Reviewer must verify each hit sits inside a quoted region.
QUOTED_UI_COLORS=(
  "#ff5f57"  # macOS traffic light — close
  "#febc2e"  # macOS traffic light — minimize
  "#28c840"  # macOS traffic light — maximize
)

CANON_FONTS=( "DM Sans" "Geist Mono" )

lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }

expand_hex() {
  local c
  c="$(lower "$1")"
  if [[ "$c" =~ ^#[0-9a-f]{3}$ ]]; then
    c="#${c:1:1}${c:1:1}${c:2:1}${c:2:1}${c:3:1}${c:3:1}"
  fi
  printf '%s' "$c"
}

# classify_color — emit one of: CANON, SURFACE, QUOTED-UI, DRIFT.
classify_color() {
  local c
  c="$(expand_hex "$1")"
  for canon in "${CANON_COLORS[@]}"; do
    [[ "$c" == "$canon" ]] && { echo "CANON"; return; }
  done
  for s in "${SURFACE_LADDER[@]}"; do
    [[ "$c" == "$s" ]] && { echo "SURFACE"; return; }
  done
  for q in "${QUOTED_UI_COLORS[@]}"; do
    [[ "$c" == "$q" ]] && { echo "QUOTED-UI"; return; }
  done
  echo "DRIFT"
}

is_canon_font() {
  local f="$1"
  for canon in "${CANON_FONTS[@]}"; do
    [[ "$f" == "$canon" ]] && return 0
  done
  return 1
}

scan_file() {
  local file="$1"
  local label
  label="$(basename "$(dirname "$file")")"

  echo
  echo "── $label ──────────────────────────────────────"

  # 1. Hex colors. Capture #rgb, #rrggbb, #rrggbbaa.
  # Strip HTML numeric entities (e.g. &#8592;) before matching so the leading
  # `#` of an entity isn't mistaken for a CSS color.
  echo "[hex colors]"
  sed 's/&#[0-9]\{1,\};//g' "$file" \
    | grep -nEoi '#[0-9a-f]{3,8}\b' \
    | sort -t: -k1,1n -u \
    | while IFS=: read -r line color; do
        cl="$(lower "$color")"
        verdict="$(classify_color "$cl")"
        case "$verdict" in
          CANON|SURFACE)
            [[ "$MODE" == "raw" ]] && printf "  %4s  %-10s  %s\n" "$line" "$cl" "$verdict"
            ;;
          QUOTED-UI)
            printf "  %4s  %-10s  QUOTED-UI  (allowed inside citation region — verify visual containment)\n" "$line" "$cl"
            ;;
          DRIFT)
            printf "  %4s  %-10s  DRIFT\n" "$line" "$cl"
            ;;
        esac
      done

  # 2. rgba/rgb colors — surface drift candidates.
  echo "[rgba/rgb]"
  grep -nEo 'rgba?\([^)]+\)' "$file" \
    | awk -F: '{
        line=$1
        $1=""
        sub(/^ /, "")
        print line " " $0
      }' \
    | sort -k1,1n -u \
    | head -50 \
    | while read -r line val; do
        printf "  %4s  %s\n" "$line" "$val"
      done

  # 3. font-family declarations.
  echo "[font-family]"
  grep -nE "font-family" "$file" \
    | sed -E "s/^([0-9]+):.*font-family[^a-zA-Z'\"]*['\"]?([^,;'\"]+).*/\1\t\2/" \
    | sort -u \
    | while IFS=$'\t' read -r line font; do
        font="${font## }"; font="${font%% }"
        if is_canon_font "$font"; then
          [[ "$MODE" == "raw" ]] && printf "  %4s  %-20s  ✓\n" "$line" "$font"
        else
          printf "  %4s  %-20s  DRIFT\n" "$line" "$font"
        fi
      done

  # 4. depth-suspicious patterns (gradients, shadows, borders around content).
  echo "[depth signals]"
  grep -nE "radial-gradient|linear-gradient|box-shadow|text-shadow" "$file" \
    | head -20 \
    | sed -E 's/^([0-9]+):[[:space:]]*/  \1  /'
}

echo "Shumi study film — palette & typography scan"
echo "Mode: $MODE"
echo "Canon colors:    ${CANON_COLORS[*]}"
echo "Surface ladder:  ${SURFACE_LADDER[*]}"
echo "Quoted-UI:       ${QUOTED_UI_COLORS[*]}"
echo "Canon fonts:     ${CANON_FONTS[*]}"
echo
echo "Verdict legend:"
echo "  CANON      — token from the locked palette"
echo "  SURFACE    — surface ladder, allowed by exception"
echo "  QUOTED-UI  — foreign palette, allowed only inside contained citation"
echo "  DRIFT      — must be reconciled before publish"

for f in "${FILMS[@]}"; do
  [[ -f "$f" ]] || { echo "missing: $f"; continue; }
  scan_file "$f"
done

echo
echo "── done ──"
