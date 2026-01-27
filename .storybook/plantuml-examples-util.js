// Utility to extract PlantUML code blocks from a markdown file
const fs = require('fs');
const path = require('path');

/**
 * Extracts all PlantUML code blocks from a markdown file.
 * @param {string} mdPath - Path to the markdown file
 * @returns {Array<{title: string, code: string, meta: string}>}
 */
function extractPlantUmlBlocks(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf8');
  const regex = /```kroki([^\n]*)\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  while ((match = regex.exec(content))) {
    const meta = match[1].trim();
    const code = match[2].trim();
    // Try to extract a title from meta string
    const titleMatch = meta.match(/imgTitle\s*=\s*"([^"]+)"/);
    blocks.push({
      title: titleMatch ? titleMatch[1] : 'PlantUML Example',
      code,
      meta
    });
  }
  return blocks;
}

// Example usage (uncomment to test):
// const blocks = extractPlantUmlBlocks(path.join(__dirname, '../test-docusaurus-site/docs/plantuml-examples.md'));
// console.log(blocks);

module.exports = { extractPlantUmlBlocks };
