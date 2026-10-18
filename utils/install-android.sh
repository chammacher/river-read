#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

echo "Building Android release..."

cd android

./gradlew installRelease

echo "Android release installed successfully."