#!/usr/bin/env bash
set -euo pipefail
DIR=$(cd "$(dirname "$0")" && pwd)
node "$DIR/../bin/neonrender.js" "Hello, Neon"

