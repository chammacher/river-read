#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

echo "Installing iOS pods..."

cd ios

pod install

cd "$ROOT_DIR"

echo "Building and launching iOS..."

npm run ios