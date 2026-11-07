#!/bin/bash
set -e
cd /home/claude/design/video
one() { # page lang
  local name=$1 l=$2 out=out_${1}_${2}
  rm -rf $out; node render.js "$name.html?lang=$l" $out full > $out.log 2>&1
  ffmpeg -loglevel error -y -f concat -safe 0 -i $out/list.txt -c copy -movflags +faststart final_${name}_${l}.mp4
  echo "DONE $name $l" >> build.log
}
rm -f build.log
for l in en de es fr; do one intro $l & done; wait
(one vsl en; one vsl de) & (one vsl es; one vsl fr) & wait
echo ALL_DONE >> build.log
