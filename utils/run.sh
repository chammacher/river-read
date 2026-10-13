#!/bin/bash

set -e

cd "$(dirname "$0")"

echo "Stopping Gradle..."
cd ../android
./gradlew --stop

echo "Cleaning Android build..."
./gradlew clean

cd ..

echo "Starting Android app..."
npm run android