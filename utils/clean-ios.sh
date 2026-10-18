#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

echo "Cleaning iOS build..."

rm -rf ios/build

cd ios

rm -rf Pods
rm -f Podfile.lock

pod install

echo "iOS build cleaned and pods reinstalled."