#!/bin/bash
# compare every member page in member-pages.tsv (optionally only those named in $@)
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1
while IFS=$'\t' read id comp pre route key; do
  [ -n "$1" ] && [[ ! " $* " == *" $comp "* ]] && continue
  echo "== $comp"; node tools/compare-member.mjs http://localhost:5191 "$route" "$key"
done < tools/member-pages.tsv
