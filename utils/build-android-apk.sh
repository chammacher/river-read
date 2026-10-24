#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR/android"

echo "Building RiverRead APK..."

./gradlew assembleRelease

echo ""
echo "APK created at:"
echo "$ROOT_DIR/android/app/build/outputs/apk/release/app-release.apk"