#!/bin/bash
# Copy documentation files to the Docusaurus docs folder
#
# This script:
# 1. Copies README.md, CONTRIBUTING.md, definition-of-done.md from repo root
# 2. Copies ADRs from docs/adr/
# 3. Adds Docusaurus front-matter
# 4. Fixes links: internal docs links lose .md extension, external links become GitHub URLs
#
# Usage:
#   ./copy-docs.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$SCRIPT_DIR/test-docusaurus-site"
DOCS_CONTENT_DIR="$DOCS_DIR/docs"
ADR_SOURCE_DIR="$SCRIPT_DIR/docs/adr"
ADR_TARGET_DIR="$DOCS_CONTENT_DIR/adr"
GITHUB_BASE="https://github.com/bartvanderwal/remark-kroki-a11y/blob/main"

# Function to fix links in markdown files
fix_links() {
    local content="$1"

    # Transform links for Docusaurus compatibility:
    # 1. Internal doc links: remove .md extension
    # 2. docs/adr/ and docs/img/ paths: make relative to docs folder
    # 3. External dirs (features/, src/, .github/): convert to GitHub URLs

    echo "$content" | sed -E \
        -e 's|\(contributing\.md\)|(./contributing)|g' \
        -e 's|\(definition-of-done\.md\)|(./definition-of-done)|g' \
        -e 's|\(CONTRIBUTING\.md\)|(./contributing)|g' \
        -e 's|\(docs/adr/README\.md\)|(./adr/)|g' \
        -e 's|\(docs/adr/|\(./adr/|g' \
        -e 's|\(docs/img/|\(./img/|g' \
        -e "s|\(features/|\($GITHUB_BASE/features/|g" \
        -e "s|\(src/|\($GITHUB_BASE/src/|g" \
        -e "s|\(\.github/|\($GITHUB_BASE/.github/|g"
}

echo "📚 Copying documentation files to Docusaurus..."
echo ""

# Copy README.md
echo "📄 Copying README.md to docs/index.md..."
cat > "$DOCS_CONTENT_DIR/index.md" << 'FRONTMATTER'
---
id: readme-github
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
fix_links "$(cat "$SCRIPT_DIR/README.md")" >> "$DOCS_CONTENT_DIR/index.md"

# Copy CONTRIBUTING.md
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
fix_links "$(cat "$SCRIPT_DIR/CONTRIBUTING.md")" >> "$DOCS_CONTENT_DIR/contributing.md"

# Copy definition-of-done.md
echo "📄 Copying definition-of-done.md to docs/definition-of-done.md..."
cat > "$DOCS_CONTENT_DIR/definition-of-done.md" << 'FRONTMATTER'
---
id: definition-of-done
title: Definition of Done
sidebar_label: Definition of Done
description: Quality criteria for completed features and fixes
---

:::info Single Source of Truth
This page is automatically copied from the repository root `definition-of-done.md` file.
Edit the root file to update this page.
:::

---

FRONTMATTER
fix_links "$(cat "$SCRIPT_DIR/definition-of-done.md")" >> "$DOCS_CONTENT_DIR/definition-of-done.md"

# Copy ADRs
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

# Copy each ADR file
for adr_file in "$ADR_SOURCE_DIR"/0*.md; do
    if [ -f "$adr_file" ]; then
        filename=$(basename "$adr_file")
        adr_num=$(echo "$filename" | grep -o '^[0-9]*')
        adr_slug=$(echo "$filename" | sed 's/^[0-9]*-//' | sed 's/\.md$//')

        echo "   - $filename"

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
        tail -n +2 "$adr_file" >> "$ADR_TARGET_DIR/$filename"
    fi
done

# Copy ADR images
if [ -d "$ADR_SOURCE_DIR/img" ]; then
    echo "   - Copying ADR img/ folder"
    cp -r "$ADR_SOURCE_DIR/img" "$ADR_TARGET_DIR/"
fi
if [ -d "$ADR_SOURCE_DIR/images" ]; then
    echo "   - Copying ADR images/ folder"
    cp -r "$ADR_SOURCE_DIR/images" "$ADR_TARGET_DIR/"
fi

# Copy docs/img/
IMG_SOURCE_DIR="$SCRIPT_DIR/docs/img"
IMG_TARGET_DIR="$DOCS_CONTENT_DIR/img"
if [ -d "$IMG_SOURCE_DIR" ]; then
    echo "📄 Copying docs/img/ to docs/img/..."
    mkdir -p "$IMG_TARGET_DIR"
    cp -r "$IMG_SOURCE_DIR/"* "$IMG_TARGET_DIR/"
fi

echo "✅ Documentation files copied successfully"
