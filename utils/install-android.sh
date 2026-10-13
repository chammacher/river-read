#!/bin/bash
set -e

cd "$(dirname "$0")/android"
./gradlew installRelease