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
const { parsePlantUMLStateDiagram, generateAccessibleDescription: generateStateDescription } = require('./parsers/stateDiagramParser');
const { parseMermaidClassDiagram, parsePlantUMLClassDiagram, generateAccessibleDescription: generateClassDescription } = require('./parsers/classDiagramParser');
const { parseMermaidSequenceDiagram, generateAccessibleDescription: generateSequenceDescription } = require('./parsers/sequenceDiagramParser');
const { parsePlantUMLActivityDiagram, generateAccessibleDescription: generateActivityDescription } = require('./parsers/activityDiagramParser');

// Parser registry - maps (imgType, diagramType) to parser functions
// Each parser entry has: { canParse, parse, generate }
const parserRegistry = [
	{
		name: 'PlantUML State Diagram',
		canParse: (imgType, diagramType) => imgType === 'plantuml' && diagramType === 'stateDiagram',
		parse: parsePlantUMLStateDiagram,
		generate: generateStateDescription,
	},
	{
		name: 'PlantUML Class Diagram',
		canParse: (imgType, diagramType) => imgType === 'plantuml' && diagramType === 'classDiagram',
		parse: parsePlantUMLClassDiagram,
		generate: generateClassDescription,
	},
	{
		name: 'Mermaid Class Diagram',
		canParse: (imgType, _diagramType, content) => imgType === 'mermaid' && content.toLowerCase().includes('classdiagram'),
		parse: parseMermaidClassDiagram,
		generate: generateClassDescription,
	},
	{
		name: 'PlantUML Sequence Diagram',
		canParse: (imgType, diagramType) => imgType === 'plantuml' && diagramType === 'sequenceDiagram',
		parse: parseMermaidSequenceDiagram, // PlantUML participant/arrow syntax is similar
		generate: generateSequenceDescription,
	},
	{
		name: 'PlantUML Activity Diagram',
		canParse: (imgType, diagramType) => imgType === 'plantuml' && diagramType === 'activityDiagram',
		parse: parsePlantUMLActivityDiagram,
		generate: generateActivityDescription,
	},
];

// Try to generate a11y description using registered parsers
function tryGenerateA11yDescription(imgType, diagramType, content, locale) {
	for (const parser of parserRegistry) {
		if (parser.canParse(imgType, diagramType, content)) {
			try {
				const parsed = parser.parse(content);
				return parser.generate(parsed, locale);
			} catch (e) {
				console.warn(`Failed to parse ${parser.name} for a11y:`, e.message);
			}
		}
	}
	return null;
}

// Escape HTML special characters to prevent XSS
function escapeHtml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

// Extract plain text content from HTML, stripping tags
function extractTextContent(html) {
	// Remove HTML tags and decode entities
	return html
		.replace(/<[^>]*>/g, '') // Remove all HTML tags
		.replace(/&lt;/g, '<')   // Decode entities
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')    // Normalize whitespace
		.trim();
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

// Extract locale override from meta string (e.g., lang="nl" -> "nl")
function extractLocale(meta) {
	if (!meta) return null;
	const match = meta.match(/lang="([^"]+)"/);
	return match ? match[1] : null;
}

// Extract custom description from meta string (e.g., customDescription="Custom text here")
function extractCustomDescription(meta) {
	if (!meta) return null;
	const match = meta.match(/customDescription="([^"]+)"/);
	return match ? match[1] : null;
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
	// Activity diagram detection: look for start/stop, while/repeat, split, fork/join
	if (lowerContent.includes('start') || lowerContent.includes('stop') ||
	    lowerContent.includes('while ') || lowerContent.includes('repeat') ||
	    lowerContent.includes('fork') || lowerContent.includes('split')) return 'activityDiagram';
	return 'diagram';
}

// Human-readable names for diagram types
const diagramTypeNames = {
	nl: {
		stateDiagram: 'toestandsdiagrammen',
		classDiagram: 'klassendiagrammen',
		sequenceDiagram: 'sequentie-diagrammen',
		activityDiagram: 'activity diagrammen',
		erDiagram: 'ER-diagrammen',
		componentDiagram: 'componentdiagrammen',
		usecaseDiagram: 'use case diagrammen',
		diagram: 'dit diagram type',
	},
	en: {
		stateDiagram: 'state diagrams',
		classDiagram: 'class diagrams',
		sequenceDiagram: 'sequence diagrams',
		activityDiagram: 'activity diagrams',
		erDiagram: 'ER diagrams',
		componentDiagram: 'component diagrams',
		usecaseDiagram: 'use case diagrams',
		diagram: 'this diagram type',
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
// Use {diagramType} as placeholder for the specific diagram type name
const defaultFallbackA11yText = {
	nl: 'Natuurlijke taal beschrijving nog niet beschikbaar voor {diagramType}.',
	en: 'Natural language description not yet available for {diagramType}.',
};

// Localized UI labels for tabs
const uiLabels = {
	nl: {
		tabSource: 'Bron',
		tabA11y: 'In natuurlijke taal',
		summaryText: '{type} broncode voor "{title}"',
		a11ySummaryText: 'Beschrijving in natuurlijke taal voor "{title}"',
	},
	en: {
		tabSource: 'Source',
		tabA11y: 'In natural language',
		summaryText: '{type} source for "{title}"',
		a11ySummaryText: 'Natural language description for "{title}"',
	},
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
			const hideDiagram = node.meta && node.meta.includes('hideDiagram');

			// Clean meta from flags and customDescription attribute
			if (node.meta) {
				// Remove customDescription="..." attribute (with quoted value)
				node.meta = node.meta.replace(/customDescription="[^"]*"/g, '');
				// Remove simple flags
				node.meta = node.meta
					.split(/\s+/)
					.filter((m) => m !== 'hideSource' && m !== 'hideA11y' && m !== 'hideDiagram' && m !== '')
					.join(' ');
			}

			// If hideDiagram is set, skip all extra UI (only diagram will be rendered by downstream plugin)
			if (hideDiagram) return;
			// If both are hidden, skip
			if (hideSource && hideA11y) return;
			if (hideSource && !opts.showA11yDescription) return;
			if (hideA11y && !opts.showSource) return;

			// Extract metadata
			const imgType = extractDiagramType(node.meta);
			const diagramType = imgType === 'plantuml' ? detectPlantUMLDiagramType(node.value) : 'diagram';
			// Support per-block locale override via lang="nl" or lang="en"
			const blockLocale = extractLocale(node.meta) || opts.locale;
			const title = extractTitle(node.meta) || (diagramTypeNames[blockLocale] || diagramTypeNames.nl)[diagramType] || diagramType;
			const langName = languageNames[imgType] || languageNames[node.lang] || node.lang;

			const escapedCode = escapeHtml(node.value);
			const openAttr = opts.defaultExpanded ? ' open' : '';

			// Generate A11y description if applicable
			let a11yDescription = null;
			const shouldAttemptA11y = opts.showA11yDescription && !hideA11y;

			// Check for custom description override - skip all parsing if set
			const customDescription = extractCustomDescription(node.meta);
			if (shouldAttemptA11y && customDescription) {
				// Wrap plain text in <p> tag for visual display
				a11yDescription = `<p>${escapeHtml(customDescription)}</p>`;
			}

			// Try registered parsers for a11y description
			if (shouldAttemptA11y && !a11yDescription) {
				a11yDescription = tryGenerateA11yDescription(imgType, diagramType, node.value, blockLocale);
			}

			// Fallback: always show a generic message when no parser output is available
			if (shouldAttemptA11y && !a11yDescription) {
				const fallbackTemplate = (opts.fallbackA11yText && opts.fallbackA11yText[blockLocale]) || opts.fallbackA11yText.en;
				// Get the human-readable diagram type name for the fallback message
				const diagramTypeName = (diagramTypeNames[blockLocale] || diagramTypeNames.nl)[diagramType] || diagramType;
				a11yDescription = fallbackTemplate.replace('{diagramType}', diagramTypeName);
			}

			const nodesToInsert = [];

			// Determine what to show
			const showSourceTab = opts.showSource && !hideSource;
			const showA11yTab = shouldAttemptA11y && !!a11yDescription;

			// Get localized UI labels based on block locale
			const ui = uiLabels[blockLocale] || uiLabels.en;
			const tabSourceLabel = ui.tabSource;
			const tabA11yLabel = ui.tabA11y;

			if (showSourceTab && showA11yTab) {
				// Use tabs when both are available
				const summaryText = ui.summaryText
					.replace('{title}', escapeHtml(title))
					.replace('{type}', escapeHtml(langName));

				// Generate unique IDs for ARIA relationships
				const tabId = `diagram-tabs-${index}`;
			
			// Extract plain text from a11y description for aria-label
			const a11yLabelText = escapeHtml(extractTextContent(a11yDescription));

			const tabsHtml = `
<details class="${opts.cssClass}" lang="${blockLocale}"${openAttr}>
<summary>${summaryText}</summary>
<div class="${opts.cssClass}-tabs">
<div class="${opts.cssClass}-tab-buttons" role="tablist">
<button class="${opts.cssClass}-tab-btn active" data-tab="source" role="tab" aria-selected="true" id="${tabId}-tab-source" aria-controls="${tabId}-panel-source">${tabSourceLabel}</button>
<button class="${opts.cssClass}-tab-btn" data-tab="a11y" role="tab" aria-selected="false" id="${tabId}-tab-a11y" aria-controls="${tabId}-panel-a11y">${tabA11yLabel}</button>
</div>
<section class="${opts.cssClass}-tab-content active" data-tab="source" role="tabpanel" tabindex="0" id="${tabId}-panel-source" aria-label="${tabSourceLabel}">
<pre><code>${escapedCode}</code></pre>
</section>
<section class="${opts.cssClass}-tab-content" data-tab="a11y" role="tabpanel" tabindex="0" id="${tabId}-panel-a11y" aria-label="${a11yLabelText}">
${a11yDescription}
</section>
</div>
</details>`;

				nodesToInsert.push({
					type: 'html',
					value: tabsHtml
				});
			} else {
				// Use separate details blocks
				if (showSourceTab) {
					const summaryText = ui.summaryText
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
					const a11ySummaryText = ui.a11ySummaryText
						.replace('{title}', escapeHtml(title))
						.replace('{type}', escapeHtml(langName));
				
				// Extract plain text from a11y description for aria-label
				const a11yLabelText = escapeHtml(extractTextContent(a11yDescription));

				nodesToInsert.push({
					type: 'html',
					value: `
<details class="${opts.a11yCssClass}" lang="${blockLocale}"${openAttr}>
<summary>${a11ySummaryText}</summary>
<div class="${opts.a11yCssClass}-content" aria-label="${a11yLabelText}">${a11yDescription}</div>
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
