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
const { parseC4Context, generateAccessibleDescription: generateC4Description } = require('./parsers/c4DiagramParser');
const { parseMermaidPieChart, generateAccessibleDescription: generatePieDescription } = require('./parsers/pieDiagramParser');

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
		name: 'Mermaid Pie Diagram',
		canParse: (imgType, diagramType, content) => imgType === 'mermaid' && (diagramType === 'pieDiagram' || /^\s*pie\b/i.test(content)),
		parse: parseMermaidPieChart,
		generate: generatePieDescription,
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
	{
		name: 'C4 Context Diagram',
		canParse: (imgType, diagramType) => imgType === 'plantuml' && diagramType === 'c4Diagram',
		parse: parseC4Context,
		generate: generateC4Description,
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
		.replace(/<\/li>/g, '. ') // Add period after list items for natural pauses
		.replace(/<[^>]*>/g, '') // Remove all HTML tags
		.replace(/&lt;/g, '<')   // Decode entities
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')    // Normalize whitespace
		.replace(/\.\s*\./g, '.') // Remove duplicate periods
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

// Extract a11y description override from meta string
// e.g., a11yDescriptionOverride="Custom text here"
function extractDescriptionOverride(meta) {
	if (!meta) return null;
	const match = meta.match(/a11yDescriptionOverride="([^"]+)"/);
	return match ? match[1] : null;
}

// Detect PlantUML diagram type from content
function detectPlantUMLDiagramType(content) {
	const lowerContent = content.toLowerCase();
	// C4 diagram detection: look for C4-PlantUML include or C4 macros
	if (lowerContent.includes('c4_context') || lowerContent.includes('c4_component') ||
	    lowerContent.includes('c4_container') || lowerContent.includes('c4-plantuml') ||
	    /\bperson\s*\(/.test(lowerContent) || /\bsystem\s*\(/.test(lowerContent) ||
	    /\bsystem_ext\s*\(/.test(lowerContent) || /\bcontainer\s*\(/.test(lowerContent) ||
	    /\brel\s*\(/.test(lowerContent)) {
		return 'c4Diagram';
	}
	if (lowerContent.includes('statediagram') || (lowerContent.includes('@startuml') && lowerContent.includes('-->'))) {
		// Check for state diagram patterns
		if (lowerContent.includes('[*]') || lowerContent.includes('state ')) {
			return 'stateDiagram';
		}
	}
	if (lowerContent.includes('class ') || lowerContent.includes('interface ')) return 'classDiagram';
	// Sequence diagram: explicit keywords OR arrow syntax (-> or -->)
	if (lowerContent.includes('actor ') || lowerContent.includes('participant ')) return 'sequenceDiagram';
	// Also detect sequence diagrams by arrow syntax (Alice -> Bob pattern)
	if (/\w+\s*-+>\s*\w+/.test(lowerContent)) return 'sequenceDiagram';
	if (lowerContent.includes('entity ')) return 'erDiagram';
	if (lowerContent.includes('component ')) return 'componentDiagram';
	if (lowerContent.includes('usecase ')) return 'usecaseDiagram';
	// Activity diagram detection: look for :action; syntax or control flow keywords
	// Use word boundaries to avoid matching '@startuml' as 'start'
	if (/:\s*[^;]+;/.test(content) || // :action; syntax
	    /\bstart\b/.test(lowerContent) || /\bstop\b/.test(lowerContent) ||
	    lowerContent.includes('while ') || lowerContent.includes('repeat') ||
	    lowerContent.includes('fork') || lowerContent.includes('split')) return 'activityDiagram';
	return 'diagram';
}

// Detect Mermaid diagram type from content
function detectMermaidDiagramType(content) {
	const lowerContent = content.toLowerCase();
	if (/^\s*pie\b/m.test(lowerContent)) return 'pieDiagram';
	if (lowerContent.includes('classdiagram')) return 'classDiagram';
	if (lowerContent.includes('sequencediagram')) return 'sequenceDiagram';
	if (lowerContent.includes('statediagram')) return 'stateDiagram';
	if (lowerContent.includes('erdiagram')) return 'erDiagram';
	if (lowerContent.includes('flowchart') || lowerContent.includes('graph ')) return 'activityDiagram';
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
		pieDiagram: 'taartdiagrammen',
		c4Diagram: 'C4-diagrammen',
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
		pieDiagram: 'pie charts',
		c4Diagram: 'C4 diagrams',
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
		speakOutLoud: 'Spreek uit',
	},
	en: {
		tabSource: 'Source',
		tabA11y: 'In natural language',
		summaryText: '{type} source for "{title}"',
		a11ySummaryText: 'Natural language description for "{title}"',
		speakOutLoud: 'Out loud',
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

// Export utility functions for testing and potential reuse
module.exports.escapeHtml = escapeHtml;
module.exports.extractTextContent = extractTextContent;

// Main plugin export
function remarkKrokiA11y(options = {}) {
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
			const hideSpeakButton = node.meta && node.meta.includes('hideSpeakButton');

			// Extract description override BEFORE cleaning meta
			const descriptionOverride = extractDescriptionOverride(node.meta);

			// Clean meta from flags and description override attributes
			if (node.meta) {
				// Remove a11yDescriptionOverride="..."
				node.meta = node.meta.replace(/a11yDescriptionOverride="[^"]*"/g, '');
				// Remove simple flags
				node.meta = node.meta
					.split(/\s+/)
					.filter((m) => m !== 'hideSource' && m !== 'hideA11y' && m !== 'hideDiagram' && m !== 'hideSpeakButton' && m !== '')
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
			const diagramType =
				imgType === 'plantuml'
					? detectPlantUMLDiagramType(node.value)
					: imgType === 'mermaid'
						? detectMermaidDiagramType(node.value)
						: 'diagram';
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
			// Check for description override - skip all parsing if set
			// (descriptionOverride was extracted earlier, before cleaning meta)
			if (shouldAttemptA11y && descriptionOverride) {
				// Wrap plain text in <p> tag for visual display
				a11yDescription = `<p>${escapeHtml(descriptionOverride)}</p>`;
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

			const a11yLabelText = escapeHtml(extractTextContent(a11yDescription));
			const a11yTextId = `diagram-a11y-text-${index}`;
			// Build speak button if enabled globally and not hidden per-diagram
			let speakButtonHtml = '';
			if (opts.showSpeakButton && !hideSpeakButton) {
				const speakBtnId = `diagram-speak-btn-${index}`;
				const speakLabel = ui.speakOutLoud || 'Out loud';
				speakButtonHtml = `<button class="diagram-expandable-source-speak-btn" id="${speakBtnId}" data-lang="${blockLocale}" aria-describedby="${a11yTextId}" aria-label="${escapeHtml(speakLabel)}" title="${escapeHtml(speakLabel)}"><span aria-hidden="true">🗣️ ${escapeHtml(speakLabel)} &rsaquo;</span></button>`;
			}
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
${speakButtonHtml}
<div class="diagram-a11y-description-text" id="${a11yTextId}">${a11yDescription}</div>
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
				
				// Generate unique IDs for ARIA relationships
				const a11yContentId = `diagram-a11y-content-${index}`;
				const a11yTextId = `diagram-a11y-text-${index}`;
				const a11yLabelText = escapeHtml(extractTextContent(a11yDescription));

				// Build speak button if enabled globally and not hidden per-diagram
				let speakButtonHtml = '';
				if (opts.showSpeakButton && !hideSpeakButton) {
					const speakBtnId = `diagram-speak-btn-${index}`;
					const speakLabel = ui.speakOutLoud || 'Out loud';
					speakButtonHtml = `<button class="diagram-expandable-source-speak-btn" id="${speakBtnId}" data-lang="${blockLocale}" aria-describedby="${a11yTextId}" aria-label="${escapeHtml(speakLabel)}" title="${escapeHtml(speakLabel)}"><span aria-hidden="true">🗣️ ${escapeHtml(speakLabel)} &rsaquo;</span></button>`;
				}

			nodesToInsert.push({
				type: 'html',
				value: `
<details class="${opts.a11yCssClass}" lang="${blockLocale}"${openAttr}>
<summary>${a11ySummaryText}</summary>
<div class="${opts.a11yCssClass}-content" id="${a11yContentId}" aria-label="${a11yLabelText}">${speakButtonHtml}<div class="diagram-a11y-description-text" id="${a11yTextId}">${a11yDescription}</div></div>
</details>`
					});
				}
			}

			if (nodesToInsert.length > 0) {
				parent.children.splice(index + 1, 0, ...nodesToInsert);
			}
		});
	};
}

// CommonJS export for Docusaurus compatibility
module.exports = remarkKrokiA11y;
