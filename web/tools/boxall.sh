#!/bin/bash
# box-diff pages (needs a GEN_DEBUG=1 build): bash tools/boxall.sh [tol] [Comp...]
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1
tol=$1; shift
while IFS=$'\t' read id comp pre route key; do
  [ -n "$1" ] && [[ ! " $* " == *" $comp "* ]] && continue
  echo "=== $comp"; python tools/boxes.py "$id" "$route" "$tol" 2>&1 | head -${LINES_MAX:-14}
done < tools/pages.tsv
