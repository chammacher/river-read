#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR/android"

echo "Building Android App Bundle..."

./gradlew bundleRelease

echo ""
echo "Bundle created at:"
echo "android/app/build/outputs/bundle/release/app-release.aab"