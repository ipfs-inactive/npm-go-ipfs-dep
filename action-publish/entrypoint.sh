#!/usr/bin/env bash
set -eu

echo '💫 Checking for new releases...'

CURRENT=`cat package.json | jq .version`
LATEST=`curl --silent https://dist.ipfs.io/go-ipfs/versions | tail -n 1 | cut -c 2-`

if [[ "$CURRENT" != "$LATEST" ]]; then
  # the workspace starts as a detached commit, so get master.
  git checkout -b master
  git config --global user.name "${GITHUB_ACTOR}"
  git config --global user.email "${GITHUB_ACTOR}@users.noreply.github.com"

  npm version $LATEST
  npm publish --access public
  echo "📦 published $LATEST to npm"

  git push
  git push --tags
  echo "👍 pushed changes back to master"

else
  echo "💤 $CURRENT is the latest release. Going back to sleep"
  # neutral github action exit... not good, not bad.
  # https://developer.github.com/actions/creating-github-actions/accessing-the-runtime-environment/#exit-codes-and-statuses
  exit 78
fi
