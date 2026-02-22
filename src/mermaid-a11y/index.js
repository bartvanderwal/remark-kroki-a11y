/**
 * remark-mermaid-with-expandable-source
 *
 * A Remark plugin that adds expandable source code blocks and accessible descriptions
 * below Mermaid diagrams. Works with Docusaurus native @docusaurus/theme-mermaid.
 *
 * Features:
 * - Adds collapsible <details> block with diagram source code
 * - Generates accessible descriptions for screen readers (classDiagram support)
 * - No external server dependency (unlike Kroki)
 * - Keyboard accessible: native <details> element works with Enter/Space
 * - Localization support (nl, en)
 *
 * Usage in docusaurus.config.js:
 *
 *   remarkPlugins: [
 *     [require('./plugins/remark-mermaid-with-expandable-source'), {
 *       defaultExpanded: false,
 *       summaryText: 'Mermaid broncode voor "{title}"',
 *       cssClass: 'mermaid-expandable-source',
 *       locale: 'nl',                    // 'nl' or 'en'
 *       generateA11yDescription: true,   // Generate accessible descriptions
 *     }],
 *   ],
 *
 * In markdown, use hideSource to disable for specific diagrams:
 *
 *   ```mermaid hideSource
 *   classDiagram
 *   ...
 *   ```
 */

const { visit } = require('unist-util-visit');
const { parseClassDiagram, generateAccessibleDescription, generateAriaHtml } = require('./parsers/classDiagramParser');

// Escape HTML special characters to prevent XSS
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Extract title from meta string (e.g., title="My Diagram")
function extractTitle(meta) {
  if (!meta) return null;
  const match = meta.match(/title="([^"]+)"/);
  return match ? match[1] : null;
}

// Extract a descriptive name from diagram content
function extractDiagramName(content, diagramType) {
  // Skip the %%{init:...}%% line if present
  const cleanContent = content.replace(/^%%\{init:.*?\}%%\n?/, '');
  const lines = cleanContent.split('\n');

  if (diagramType === 'classDiagram') {
    // Find the first class definition
    for (const line of lines) {
      // Match "class ClassName {" or "class ClassName"
      const classMatch = line.match(/^\s*class\s+(\w+)/);
      if (classMatch) {
        return classMatch[1];
      }
    }
  }

  if (diagramType === 'flowchart') {
    // Find the first node definition
    for (const line of lines) {
      // Match node definitions like "A[Label]" or "A-->B"
      const nodeMatch = line.match(/^\s*(\w+)\s*[[({|]/);
      if (nodeMatch) {
        return nodeMatch[1];
      }
    }
  }

  if (diagramType === 'sequenceDiagram') {
    // Find the first participant
    for (const line of lines) {
      const participantMatch = line.match(/^\s*participant\s+(\w+)/i);
      if (participantMatch) {
        return participantMatch[1];
      }
      // Or first actor in sequence (e.g., "Alice->>Bob")
      const actorMatch = line.match(/^\s*(\w+)\s*(?:->>|->|-->|-->>|-\))/);
      if (actorMatch) {
        return actorMatch[1];
      }
    }
  }

  return null;
}

// Detect diagram type from Mermaid content
function detectDiagramType(content) {
  const firstLine = content.trim().split('\n')[0].toLowerCase();
  if (firstLine.includes('classdiagram')) return 'classDiagram';
  if (firstLine.includes('sequencediagram')) return 'sequenceDiagram';
  if (firstLine.includes('flowchart') || firstLine.includes('graph')) return 'flowchart';
  if (firstLine.includes('erdiagram')) return 'erDiagram';
  if (firstLine.includes('gantt')) return 'gantt';
  if (firstLine.includes('pie')) return 'pie';
  // Herken ook stateDiagram-v2, stateDiagram-v1, stateDiagram (case-insensitive)
  if (/statediagram(-v\d+)?/i.test(firstLine)) return 'stateDiagram';
  if (firstLine.includes('journey')) return 'journey';
  if (firstLine.includes('gitgraph')) return 'gitGraph';
  if (firstLine.includes('mindmap')) return 'mindmap';
  if (firstLine.includes('timeline')) return 'timeline';
  return 'diagram';
}

// Get localized diagram type name
function getLocalizedDiagramType(type, locale) {
  const names = {
    nl: {
      classDiagram: 'klassendiagram',
      sequenceDiagram: 'sequentiediagram',
      flowchart: 'flowchart',
      erDiagram: 'ER-diagram',
      gantt: 'Gantt-diagram',
      pie: 'taartdiagram',
      stateDiagram: 'toestandsdiagram',
      journey: 'user journey',
      gitGraph: 'Git-diagram',
      mindmap: 'mindmap',
      timeline: 'tijdlijn',
      diagram: 'Mermaid-diagram'
    },
    en: {
      classDiagram: 'class diagram',
      sequenceDiagram: 'sequence diagram',
      flowchart: 'flowchart',
      erDiagram: 'ER diagram',
      gantt: 'Gantt chart',
      pie: 'pie chart',
      stateDiagram: 'state diagram',
      journey: 'user journey',
      gitGraph: 'Git graph',
      mindmap: 'mindmap',
      timeline: 'timeline',
      diagram: 'Mermaid diagram'
    }
  };
  return (names[locale] || names.nl)[type] || type;
}

// Default options
const defaultOptions = {
  defaultExpanded: false,
  summaryText: 'Mermaid broncode voor "{title}"',
  a11ySummaryText: 'Toegankelijke beschrijving voor "{title}"',
  cssClass: 'mermaid-expandable-source',
  a11yCssClass: 'mermaid-a11y-description',
  locale: 'nl',
  generateA11yDescription: true,
  onlySourcecode: false, // Nieuw: toon alleen de broncode, niet het diagram
  // PlantUML-like colors: yellow #ffffcc (255,255,204), note pink #ffcccc (255,204,204)
  mermaidInit: '%%{init: {\'theme\': \'base\', \'themeVariables\': {\'primaryColor\': \'#ffffcc\', \'primaryTextColor\': \'#000\', \'primaryBorderColor\': \'#000\', \'lineColor\': \'#000\', \'strokeWidth\': \'2px\', \'classBoxBorderWidth\': \'5px\', \'noteBkgColor\': \'#ffcccc\', \'noteBorderColor\': \'#000\'}}}%%',
};

module.exports = function remarkMermaidWithExpandableSource(options = {}) {
  const opts = { ...defaultOptions, ...options };

  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || !parent.children) return;
      if (node.lang !== 'mermaid') return;

      // Inject mermaid init styling if not already present
      if (!node.value.startsWith('%%{init:')) {
        node.value = opts.mermaidInit + '\n' + node.value;
      }

      // Check for hideSource flag - skip if present
      if (node.meta && node.meta.includes('hideSource')) {
        node.meta = node.meta
          .split(/\s+/)
          .filter((m) => m !== 'hideSource')
          .join(' ');
        return;
      }

      // Check for onlySourcecode flag in meta (per block)
      const onlySourcecodeBlock = node.meta && node.meta.includes('onlySourcecode');
      if (onlySourcecodeBlock) {
        node.meta = node.meta
          .split(/\s+/)
          .filter((m) => m !== 'onlySourcecode')
          .join(' ');
      }

      // Extract or detect title and type
      const diagramType = detectDiagramType(node.value);
      const localizedType = getLocalizedDiagramType(diagramType, opts.locale);
      const diagramName = extractDiagramName(node.value, diagramType);
      // Priority: explicit title > extracted name > localized type
      const title = extractTitle(node.meta) || (diagramName ? `${localizedType} ${diagramName}` : localizedType);

      // Build summary text for source code
      const summaryText = opts.summaryText.replace('{title}', escapeHtml(title));

      // Get original source code (without injected init styling) for display
      const originalCode = node.value.startsWith('%%{init:')
        ? node.value.replace(/^%%\{init:.*?\}%%\n?/, '')
        : node.value;

      // Create the details HTML block for source code (showing original code without init)
      const escapedCode = escapeHtml(originalCode);
      const openAttr = opts.defaultExpanded ? ' open' : '';

      const nodesToInsert = [];

      // Generate accessible description if enabled and supported
      if (opts.generateA11yDescription && diagramType === 'classDiagram') {
        try {
          const parsed = parseClassDiagram(node.value);
          const a11yDescription = generateAccessibleDescription(parsed, opts.locale);
          const a11yHtml = generateAriaHtml(parsed, opts.locale);

          // Add ARIA HTML (visually hidden but accessible)
          nodesToInsert.push({
            type: 'html',
            value: a11yHtml
          });

          // Add expandable accessible description (visible)
          const a11ySummaryText = opts.a11ySummaryText.replace('{title}', escapeHtml(title));
          const a11yDetailsHtml = `\n<details class="${opts.a11yCssClass}-details"${openAttr}>\n<summary>${a11ySummaryText}</summary>\n<div class="${opts.a11yCssClass}-content">\n<pre>${escapeHtml(a11yDescription)}</pre>\n</div>\n</details>\n`;
          nodesToInsert.push({
            type: 'html',
            value: a11yDetailsHtml
          });
        } catch (e) {
          // If parsing fails, just continue without a11y description
          console.warn('Failed to parse Mermaid classDiagram for a11y:', e.message);
        }
      }

      // Add source code details block
      const sourceDetailsHtml = `\n<details class="${opts.cssClass}"${openAttr}>\n<summary>${summaryText}</summary>\n<pre><code>${escapedCode}</code></pre>\n</details>\n`;
      nodesToInsert.push({
        type: 'html',
        value: sourceDetailsHtml
      });

      if (onlySourcecodeBlock || opts.onlySourcecode) {
        // Vervang het codeblok door alleen de details (verwijder het codeblok zelf)
        parent.children.splice(index, 1, ...nodesToInsert);
      } else {
        // Voeg details toe na het codeblok (standaard gedrag)
        if (nodesToInsert.length > 0) {
          parent.children.splice(index + 1, 0, ...nodesToInsert);
        }
      }
    });
  };
};
