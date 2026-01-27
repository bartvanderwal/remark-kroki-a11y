/**
 * remark-kroki-a11y
 *
 * A Remark plugin that adds accessible source code details and natural language
 * descriptions to Kroki diagrams (PlantUML, Mermaid, C4, GraphViz, etc.).
 *
 * Note: This plugin has only been tested with Docusaurus. It should work with
 * other unified/remark-based systems, but this has not been verified.
 *
 * Features:
 * - Adds collapsible <details> block with diagram source code
 * - Generates natural language descriptions for screen readers (state diagrams supported)
 * - Tabs interface for source code and description
 * - Keyboard accessible: native <details> element works with Enter/Space
 * - Localization support (nl, en)
 *
 * Usage in docusaurus.config.js:
 *
 *   remarkPlugins: [
 *     [require('remark-kroki-a11y'), {
 *       showSource: true,
 *       showA11yDescription: true,
 *       defaultExpanded: false,
 *       useTabs: true,
 *       summaryText: '{type} source code for "{title}"',
 *       a11ySummaryText: 'Natural language description for "{title}"',
 *       tabSourceLabel: 'Source',
 *       tabA11yLabel: 'Description',
 *       cssClass: 'diagram-expandable-source',
 *       languages: ['kroki'],
 *       locale: 'en',
 *     }],
 *     [require('remark-kroki-plugin'), { ... }],  // Must come AFTER this plugin
 *   ],
 *
 * In markdown, use flags to control per-diagram:
 *
 *   ```kroki hideSource imgType="plantuml"
 *   @startuml
 *   ...
 *   @enduml
 *   ```
 *
 *   ```kroki hideA11y imgType="plantuml"
 *   ...
 *   ```
 */

const { visit } = require('unist-util-visit');
const { parsePlantUMLStateDiagram, generateAccessibleDescription } = require('./parsers/stateDiagramParser');

// Escape HTML special characters to prevent XSS
function escapeHtml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

// Extract diagram type from meta string (e.g., imgType="plantuml" -> "plantuml")
function extractDiagramType(meta) {
	if (!meta) return null;
	const match = meta.match(/imgType="([^"]+)"/);
	return match ? match[1] : null;
}

// Extract title from meta string
function extractTitle(meta) {
	if (!meta) return null;
	const imgTitleMatch = meta.match(/imgTitle="([^"]+)"/);
	if (imgTitleMatch) return imgTitleMatch[1];
	const titleMatch = meta.match(/title="([^"]+)"/);
	if (titleMatch) return titleMatch[1];
	return null;
}

// Detect PlantUML diagram type from content
function detectPlantUMLDiagramType(content) {
	const lowerContent = content.toLowerCase();
	if (lowerContent.includes('statediagram') || (lowerContent.includes('@startuml') && lowerContent.includes('-->'))) {
		// Check for state diagram patterns
		if (lowerContent.includes('[*]') || lowerContent.includes('state ')) {
			return 'stateDiagram';
		}
	}
	if (lowerContent.includes('class ') || lowerContent.includes('interface ')) return 'classDiagram';
	if (lowerContent.includes('actor ') || lowerContent.includes('participant ')) return 'sequenceDiagram';
	if (lowerContent.includes('entity ')) return 'erDiagram';
	if (lowerContent.includes('component ')) return 'componentDiagram';
	if (lowerContent.includes('usecase ')) return 'usecaseDiagram';
	return 'diagram';
}

// Human-readable names for diagram types
const diagramTypeNames = {
	nl: {
		stateDiagram: 'toestandsdiagram',
		classDiagram: 'klassendiagram',
		sequenceDiagram: 'sequentiediagram',
		erDiagram: 'ER-diagram',
		componentDiagram: 'componentdiagram',
		usecaseDiagram: 'use case diagram',
		diagram: 'diagram',
	},
	en: {
		stateDiagram: 'state diagram',
		classDiagram: 'class diagram',
		sequenceDiagram: 'sequence diagram',
		erDiagram: 'ER diagram',
		componentDiagram: 'component diagram',
		usecaseDiagram: 'use case diagram',
		diagram: 'diagram',
	}
};

// Human-readable names for diagram languages
// Note: 'kroki' maps to 'Diagram' because Kroki is a tool, not a language.
// The actual language (PlantUML, Mermaid, etc.) should come from imgType.
const languageNames = {
	kroki: 'Diagram',  // Fallback - should rarely be used if imgType is set correctly
	plantuml: 'PlantUML',
	mermaid: 'Mermaid',
	graphviz: 'GraphViz',
	d2: 'D2',
	c4plantuml: 'C4 (PlantUML)',
	structurizr: 'Structurizr',
	ditaa: 'Ditaa',
	erd: 'ERD',
	nomnoml: 'Nomnoml',
	svgbob: 'Svgbob',
	vega: 'Vega',
	vegalite: 'Vega-Lite',
	wavedrom: 'WaveDrom',
	bpmn: 'BPMN',
	bytefield: 'Bytefield',
	excalidraw: 'Excalidraw',
	pikchr: 'Pikchr',
	umlet: 'UMLet',
};

// Fallback text when no a11y description can be generated
const defaultFallbackA11yText = {
	nl: 'Natuurlijke taal beschrijving is nog niet beschikbaar voor dit diagram type.',
	en: 'Natural language description is not available for this diagram type yet.',
};

// Default options
const defaultOptions = {
	showSource: true,
	showA11yDescription: true,
	defaultExpanded: false,
	summaryText: '{type} source code for "{title}"',
	a11ySummaryText: 'Natural language description for "{title}"',
	tabSourceLabel: 'Source',
	tabA11yLabel: 'Description',
	cssClass: 'diagram-expandable-source',
	a11yCssClass: 'diagram-a11y-description',
	languages: ['kroki'],
	locale: 'en',
	fallbackA11yText: defaultFallbackA11yText,
};

module.exports = function remarkKrokiWithExpandableSource(options = {}) {
	const opts = {
		...defaultOptions,
		...options,
		// Merge fallback texts per locale so users can override one language
		fallbackA11yText: {
			...defaultFallbackA11yText,
			...(options.fallbackA11yText || {}),
		},
	};
	const languages = Array.isArray(opts.languages) ? opts.languages : [opts.languages];

	return (tree) => {
		visit(tree, 'code', (node, index, parent) => {
			if (!parent || !parent.children) return;
			if (!languages.includes(node.lang)) return;

			// Check for hide flags
			const hideSource = node.meta && node.meta.includes('hideSource');
			const hideA11y = node.meta && node.meta.includes('hideA11y');

			// Clean meta from flags
			if (node.meta) {
				node.meta = node.meta
					.split(/\s+/)
					.filter((m) => m !== 'hideSource' && m !== 'hideA11y')
					.join(' ');
			}

			// If both are hidden, skip
			if (hideSource && hideA11y) return;
			if (hideSource && !opts.showA11yDescription) return;
			if (hideA11y && !opts.showSource) return;

			// Extract metadata
			const imgType = extractDiagramType(node.meta);
			const diagramType = imgType === 'plantuml' ? detectPlantUMLDiagramType(node.value) : 'diagram';
			const title = extractTitle(node.meta) || (diagramTypeNames[opts.locale] || diagramTypeNames.nl)[diagramType] || diagramType;
			const langName = languageNames[imgType] || languageNames[node.lang] || node.lang;

			const escapedCode = escapeHtml(node.value);
			const openAttr = opts.defaultExpanded ? ' open' : '';

			// Generate A11y description if applicable
			let a11yDescription = null;
			const shouldAttemptA11y = opts.showA11yDescription && !hideA11y;

			if (shouldAttemptA11y && imgType === 'plantuml' && diagramType === 'stateDiagram') {
				try {
					const parsed = parsePlantUMLStateDiagram(node.value);
					a11yDescription = generateAccessibleDescription(parsed, opts.locale);
				} catch (e) {
					console.warn('Failed to parse PlantUML state diagram for a11y:', e.message);
				}
			}

			// Fallback: always show a generic message when no parser output is available
			if (shouldAttemptA11y && !a11yDescription) {
				const fallback = (opts.fallbackA11yText && opts.fallbackA11yText[opts.locale]) || opts.fallbackA11yText.en;
				a11yDescription = fallback;
			}

			const nodesToInsert = [];

			// Determine what to show
			const showSourceTab = opts.showSource && !hideSource;
			const showA11yTab = shouldAttemptA11y && !!a11yDescription;

			if (showSourceTab && showA11yTab) {
				// Use tabs when both are available
				const summaryText = opts.summaryText
					.replace('{title}', escapeHtml(title))
					.replace('{type}', escapeHtml(langName));

				const tabsHtml = `
<details class="${opts.cssClass}"${openAttr}>
<summary>${summaryText}</summary>
<div class="${opts.cssClass}-tabs">
<div class="${opts.cssClass}-tab-buttons">
<button class="${opts.cssClass}-tab-btn active" data-tab="source">${opts.tabSourceLabel}</button>
<button class="${opts.cssClass}-tab-btn" data-tab="a11y">${opts.tabA11yLabel}</button>
</div>
<div class="${opts.cssClass}-tab-content active" data-tab="source">
<pre><code>${escapedCode}</code></pre>
</div>
<div class="${opts.cssClass}-tab-content" data-tab="a11y">
<pre>${escapeHtml(a11yDescription)}</pre>
</div>
</div>
</details>`;

				nodesToInsert.push({
					type: 'html',
					value: tabsHtml
				});
			} else {
				// Use separate details blocks
				if (showSourceTab) {
					const summaryText = opts.summaryText
						.replace('{title}', escapeHtml(title))
						.replace('{type}', escapeHtml(langName));

					nodesToInsert.push({
						type: 'html',
						value: `
<details class="${opts.cssClass}"${openAttr}>
<summary>${summaryText}</summary>
<pre><code>${escapedCode}</code></pre>
</details>`
					});
				}

				if (showA11yTab) {
					const a11ySummaryText = opts.a11ySummaryText
						.replace('{title}', escapeHtml(title))
						.replace('{type}', escapeHtml(langName));

					nodesToInsert.push({
						type: 'html',
						value: `
<details class="${opts.a11yCssClass}"${openAttr}>
<summary>${a11ySummaryText}</summary>
<pre>${escapeHtml(a11yDescription)}</pre>
</details>`
					});
				}
			}

			if (nodesToInsert.length > 0) {
				parent.children.splice(index + 1, 0, ...nodesToInsert);
			}
		});
	};
};
