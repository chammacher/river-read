#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

TYPE=$1

if [[ "$TYPE" != "patch" && "$TYPE" != "minor" && "$TYPE" != "major" ]]; then
  echo "Usage:"
  echo "  ./utils/release.sh patch"
  echo "  ./utils/release.sh minor"
  echo "  ./utils/release.sh major"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: Git working tree is not clean."
  echo "Commit or stash your changes before creating a release."
  exit 1
fi

echo "Creating $TYPE release..."

npm version "$TYPE"

echo "Pushing commit and tag..."

git push
git push --tags

echo "Release complete."