#!/bin/bash
# Start the documentation site (Docusaurus) for remark-kroki-a11y
#
# This script:
# 1. Copies README.md and CONTRIBUTING.md from the repo root to the docs folder
#    (single source of truth - these files are maintained in the root for GitHub)
# 2. Copies ADRs from docs/adr/ to the Docusaurus docs folder
# 3. Adds Docusaurus front-matter to the copied files
# 4. Converts GitHub-relative links to work within Docusaurus
# 5. Starts the Docusaurus development server
#
# The docs are available at http://localhost:3000/remark-kroki-a11y/
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
DOCS_CONTENT_DIR="$DOCS_DIR/docs"
ADR_SOURCE_DIR="$SCRIPT_DIR/docs/adr"
ADR_TARGET_DIR="$DOCS_CONTENT_DIR/adr"

echo "📚 Starting remark-kroki-a11y documentation site..."
echo "   Directory: $DOCS_DIR"
echo ""

 # Copy README.md with front-matter for Docusaurus
echo "📄 Copying README.md to docs/index.md..."
cat > "$DOCS_CONTENT_DIR/index.md" << 'FRONTMATTER'
---
id: readme
title: README (GitHub)
sidebar_label: README
description: The main README file from the GitHub repository
---

:::info Single Source of Truth
This page is automatically copied from the repository root `README.md` file.
The original file is maintained for GitHub and does not contain Docusaurus-specific markup.
Edit the root `README.md` to update this page.
:::

---

FRONTMATTER

# Copy README and fix links that don't work in Docusaurus
# - docs/adr/README.md becomes ./adr/ (index page)
# - docs/adr/... links point to internal Docusaurus ADR pages
# - CONTRIBUTING.md becomes ./contributing (internal docusaurus link)
sed -e 's|(docs/adr/README.md)|(./adr/)|g' \
    -e 's|(docs/adr/|(./adr/|g' \
    -e 's|\[CONTRIBUTING.md\](CONTRIBUTING.md)|[Contributing](./contributing)|g' \
    "$SCRIPT_DIR/README.md" >> "$DOCS_CONTENT_DIR/index.md"

# Copy CONTRIBUTING.md with front-matter for Docusaurus
echo "📄 Copying CONTRIBUTING.md to docs/contributing.md..."
cat > "$DOCS_CONTENT_DIR/contributing.md" << 'FRONTMATTER'
---
id: contributing
title: Contributing
sidebar_label: Contributing
description: How to contribute to remark-kroki-a11y
---

:::info Single Source of Truth
This page is automatically copied from the repository root `CONTRIBUTING.md` file.
The original file is maintained for GitHub and does not contain Docusaurus-specific markup.
Edit the root `CONTRIBUTING.md` to update this page.
:::

---

FRONTMATTER
cat "$SCRIPT_DIR/CONTRIBUTING.md" >> "$DOCS_CONTENT_DIR/contributing.md"

# Copy ADRs with front-matter for Docusaurus
echo "📄 Copying ADRs to docs/adr/..."
mkdir -p "$ADR_TARGET_DIR"

# Copy ADR index/README
cat > "$ADR_TARGET_DIR/index.md" << 'FRONTMATTER'
---
id: index
title: Architecture Decision Records
sidebar_label: Overview
description: Overview of Architecture Decision Records for remark-kroki-a11y
---

:::info Single Source of Truth
This page is automatically copied from `docs/adr/README.md` in the repository.
Edit the source file to update this page.
:::

---

FRONTMATTER
cat "$ADR_SOURCE_DIR/README.md" >> "$ADR_TARGET_DIR/index.md"

# Copy each ADR file (0001-*.md, 0002-*.md, etc.)
for adr_file in "$ADR_SOURCE_DIR"/0*.md; do
    if [ -f "$adr_file" ]; then
        filename=$(basename "$adr_file")
        # Extract ADR number and create a readable title
        adr_num=$(echo "$filename" | grep -o '^[0-9]*')
        # Extract title from filename (remove number prefix and .md suffix)
        adr_slug=$(echo "$filename" | sed 's/^[0-9]*-//' | sed 's/\.md$//')

        echo "   - $filename"

        # Create target file with front-matter
        cat > "$ADR_TARGET_DIR/$filename" << FRONTMATTER
---
id: $adr_slug
title: "ADR-$adr_num: $(head -1 "$adr_file" | sed 's/^# //')"
sidebar_label: "ADR-$adr_num"
description: "Architecture Decision Record $adr_num"
---

:::info Single Source of Truth
This ADR is automatically copied from \`docs/adr/$filename\` in the repository.
Edit the source file to update this page.
:::

---

FRONTMATTER
        # Append original content (skip the first line which is the title)
        tail -n +2 "$adr_file" >> "$ADR_TARGET_DIR/$filename"
    fi
done

# Copy ADR images if they exist
if [ -d "$ADR_SOURCE_DIR/img" ]; then
    echo "   - Copying img/ folder"
    cp -r "$ADR_SOURCE_DIR/img" "$ADR_TARGET_DIR/"
fi
if [ -d "$ADR_SOURCE_DIR/images" ]; then
    echo "   - Copying images/ folder"
    cp -r "$ADR_SOURCE_DIR/images" "$ADR_TARGET_DIR/"
fi

echo "✅ Documentation files copied successfully"
echo ""

# Check if node_modules exists
if [ ! -d "$DOCS_DIR/node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    cd "$DOCS_DIR"
    npm install
fi

cd "$DOCS_DIR"

echo "🚀 Starting Docusaurus development server..."
echo "   Open http://localhost:3000/remark-kroki-a11y/ in your browser"
echo ""

npm start
