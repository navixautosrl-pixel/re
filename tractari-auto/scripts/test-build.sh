#!/bin/sh
# Builds the two exports the tests need. The dummy key never reaches Google: tests mock the calls.
set -e
cd "$(dirname "$0")/.."
NEXT_PUBLIC_GOOGLE_MAPS_KEY=test-key npx next build
rm -rf out-maps && mv out out-maps
# manual-km export: force no key even if .env.local holds the real one
NEXT_PUBLIC_GOOGLE_MAPS_KEY= npx next build
