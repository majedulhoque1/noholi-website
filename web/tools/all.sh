#!/bin/bash
# compare every page in pages.tsv (optionally only those whose component matches $1)
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1
while IFS=$'\t' read id comp pre route key; do
  [ -n "$1" ] && [[ ! " $* " == *" $comp "* ]] && continue
  echo "== $comp"; node tools/errors.mjs "http://localhost:5191$route"; node tools/compare.mjs http://localhost:5191 "$route" "$key"
done < tools/pages.tsv
