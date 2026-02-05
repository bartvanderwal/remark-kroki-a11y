#!/bin/bash
# Start the documentation site (Docusaurus) for remark-kroki-a11y
#
# This script:
# 1. Runs copy-docs.sh to copy README, CONTRIBUTING, and ADRs to the docs folder
# 2. Starts the Docusaurus development server
#
# The docs are available at http://localhost:3001/remark-kroki-a11y/
#
# Prerequisites:
#   - Node.js (v18 or higher recommended)
#   - npm dependencies installed in test-docusaurus-site/
#
# Usage:
#   ./start-docs.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$SCRIPT_DIR/test-docusaurus-site"

echo "📚 Starting remark-kroki-a11y documentation site..."
echo "   Directory: $DOCS_DIR"
echo ""

# Copy documentation files
"$SCRIPT_DIR/copy-docs.sh"

echo ""

# Check if node_modules exists
if [ ! -d "$DOCS_DIR/node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    cd "$DOCS_DIR"
    npm install
fi

cd "$DOCS_DIR"

echo "🚀 Starting Docusaurus development server..."
echo "   Open http://localhost:3001/remark-kroki-a11y/ in your browser"
echo ""

npm start
