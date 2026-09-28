#!/bin/bash
# regenerate pages in pages.tsv (all, or only the named components)
cd "$(dirname "$0")/.."
while IFS=$'\t' read id comp pre route key; do
  [ -n "$1" ] && [[ ! " $* " == *" $comp "* ]] && continue
  python tools/gen.py "$id" "$comp" "$pre"
done < tools/pages.tsv
