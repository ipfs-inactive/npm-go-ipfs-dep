#!/usr/bin/env bash
set -eu

echo '💫 Checking for new releases...'

CURRENT=`node -e 'console.log(require("./package.json").version)'`
LATEST=`curl --silent https://dist.ipfs.io/go-ipfs/versions | tail -n 1 | cut -c 2-`

if [[ "$CURRENT" != "$LATEST" ]]; then
  echo "🎉 New release exists $LATEST"
else
  echo "💤 $CURRENT is the latest release. Going back to sleep"
  # neutral github action exit... not good, not bad.
  # https://developer.github.com/actions/creating-github-actions/accessing-the-runtime-environment/#exit-codes-and-statuses
  exit 78
fi
