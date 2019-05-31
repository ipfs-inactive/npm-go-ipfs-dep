#!/usr/bin/env bash
set -eu

echo '💫 Checking for new releases...'

CURRENT=`node -e 'console.log(require("./package.json").version)'`
LATEST=`curl --silent https://dist.ipfs.io/go-ipfs/versions | tail -n 1 | cut -c 2-`

if [ -n "$NPM_AUTH_TOKEN" ]; then
  # Respect NPM_CONFIG_USERCONFIG if it is provided, default to $HOME/.npmrc
  NPM_CONFIG_USERCONFIG="${NPM_CONFIG_USERCONFIG-"$HOME/.npmrc"}"
  NPM_REGISTRY_URL="${NPM_REGISTRY_URL-registry.npmjs.org}"
  NPM_STRICT_SSL="${NPM_STRICT_SSL-true}"
  NPM_REGISTRY_SCHEME="https"
  if ! $NPM_STRICT_SSL
  then
    NPM_REGISTRY_SCHEME="http"
  fi

  # Allow registry.npmjs.org to be overridden with an environment variable
  printf "//%s/:_authToken=%s\\nregistry=%s\\nstrict-ssl=%s" "$NPM_REGISTRY_URL" "$NPM_AUTH_TOKEN" "${NPM_REGISTRY_SCHEME}://$NPM_REGISTRY_URL" "${NPM_STRICT_SSL}" > "$NPM_CONFIG_USERCONFIG"

  chmod 0600 "$NPM_CONFIG_USERCONFIG"
fi

if [[ "$CURRENT" != "$LATEST" ]]; then
  echo "🎉 New release exists $LATEST"

  # The workspace starts as a detached commit for scheduled builds...
  git checkout -b master
  # Set sensible commit info
  git config --global user.name "${GITHUB_ACTOR}"
  git config --global user.email "${GITHUB_ACTOR}@users.noreply.github.com"

  npm version $LATEST
  npm publish --access public
  echo "📦 published $LATEST to npm"

  git push -u origin master
  git push --tags
  echo "👍 pushed changes back to master"

else
  echo "💤 $CURRENT is the latest release. Going back to sleep"
  # neutral github action exit... not good, not bad.
  # https://developer.github.com/actions/creating-github-actions/accessing-the-runtime-environment/#exit-codes-and-statuses
  exit 78
fi
