#!/usr/bin/env bash
# Downloads the landing-page photos into public/photos.
# All photos are free to use: Unsplash License / Pexels License.
# Run once from the project root:  bash scripts/get-photos.sh
set -u
mkdir -p public/photos
cd public/photos

get() {
  local name="$1" url="$2"
  curl -sSL --fail -A "Mozilla/5.0" -o "$name.tmp" "$url" || { echo "FAILED  $name"; rm -f "$name.tmp"; return; }
  if file "$name.tmp" | grep -qiE 'jpeg|jpg|png|webp'; then
    mv "$name.tmp" "$name"; echo "ok      $name ($(du -k "$name" | cut -f1) KB)"
  else
    echo "FAILED  $name (not an image)"; rm -f "$name.tmp"
  fi
}

# Pexels
get team.jpg      "https://images.pexels.com/photos/3184663/pexels-photo-3184663.jpeg?auto=compress&cs=tinysrgb&w=1800"
get coffee.jpg    "https://images.pexels.com/photos/3182795/pexels-photo-3182795.jpeg?auto=compress&cs=tinysrgb&w=1600"
get resume.jpg    "https://images.pexels.com/photos/3183151/pexels-photo-3183151.jpeg?auto=compress&cs=tinysrgb&w=1600"
get interview.jpg "https://images.pexels.com/photos/3184354/pexels-photo-3184354.jpeg?auto=compress&cs=tinysrgb&w=1600"
get laughing.jpg  "https://images.pexels.com/photos/3182804/pexels-photo-3182804.jpeg?auto=compress&cs=tinysrgb&w=1600"
get meeting.jpg   "https://images.pexels.com/photos/3183172/pexels-photo-3183172.jpeg?auto=compress&cs=tinysrgb&w=1600"
get candidate.jpg "https://images.pexels.com/photos/3182777/pexels-photo-3182777.jpeg?auto=compress&cs=tinysrgb&w=1600"

ls -la
