/**
 * Unsupported Diagram Parser
 *
 * Detects diagram types that are not yet supported and generates
 * appropriate accessibility messages.
 */

// GitHub repository for contribution
const GITHUB_REPO = 'https://github.com/AIM-ENE/remark-kroki-a11y';

// Diagram type names per locale
const diagramTypeNames = {
  nl: {
    c4: 'C4',
    sequence: 'sequence',
    activity: 'activity',
    state: 'state',
    er: 'ER',
    gantt: 'Gantt',
    pie: 'pie chart',
    unknown: 'dit type',
  },
  en: {
    c4: 'C4',
    sequence: 'sequence',
    activity: 'activity',
    state: 'state',
    er: 'ER',
    gantt: 'Gantt',
    pie: 'pie chart',
    unknown: 'this type of',
  }
};

// Message templates per locale
const i18n = {
  nl: {
    notSupportedTemplate: 'De remark-kroki-a11y plugin ondersteunt nog geen {type} diagrammen.',
    contributeLink: `<a href="${GITHUB_REPO}" target="_blank" rel="noopener noreferrer">Draag bij aan dit A11Y project</a> om ondersteuning toe te voegen voor andere diagram types of (natuurlijk) talen.`,
  },
  en: {
    notSupportedTemplate: 'The remark-kroki-a11y plugin does not yet support {type} diagrams.',
    contributeLink: `<a href="${GITHUB_REPO}" target="_blank" rel="noopener noreferrer">Contribute to this A11Y project</a> to add support for other diagram types or (natural) languages.`,
  }
};

/**
 * Detect if code is a C4 diagram
 */
function isC4Diagram(code, diagramType) {
  if (diagramType && diagramType.toLowerCase().startsWith('c4')) {
    return true;
  }
  const lowerCode = code.toLowerCase();
  return lowerCode.includes('!include <c4/') ||
	       lowerCode.includes('!include https://raw.githubusercontent.com/plantuml-stdlib/c4-plantuml') ||
	       lowerCode.includes('c4_context') ||
	       lowerCode.includes('c4_container') ||
	       lowerCode.includes('c4_component');
}

/**
 * Detect diagram type from code and optional type hint
 */
function detectUnsupportedDiagramType(code, diagramType) {
  // Check explicit diagram type first
  if (diagramType) {
    const type = diagramType.toLowerCase();
    if (type.startsWith('c4')) return 'c4';
    if (type === 'sequence') return 'sequence';
    if (type === 'activity') return 'activity';
    if (type === 'state') return 'state';
    if (type === 'er' || type === 'erdiagram') return 'er';
    if (type === 'gantt') return 'gantt';
    if (type === 'pie') return 'pie';
  }

  // Check code content
  if (isC4Diagram(code, diagramType)) return 'c4';

  const lowerCode = code.toLowerCase();
  if (lowerCode.includes('sequencediagram') || lowerCode.includes('@startsequence')) return 'sequence';
  if (lowerCode.includes('activitydiagram') || lowerCode.includes('@startactivity')) return 'activity';
  if (lowerCode.includes('statediagram') || lowerCode.includes('@startstate')) return 'state';
  if (lowerCode.includes('erdiagram')) return 'er';
  if (lowerCode.includes('gantt')) return 'gantt';
  if (lowerCode.includes('pie')) return 'pie';

  return 'unknown';
}

/**
 * Generate an accessibility description for unsupported diagram types
 */
function generateUnsupportedDescription(code, diagramType, locale = 'nl') {
  const t = i18n[locale] || i18n.nl;
  const typeNames = diagramTypeNames[locale] || diagramTypeNames.nl;
  const type = detectUnsupportedDiagramType(code, diagramType);

  const typeName = typeNames[type] || typeNames.unknown;
  const message = t.notSupportedTemplate.replace('{type}', typeName);

  return message + ' ' + t.contributeLink;
}

/**
 * Check if a diagram type is supported
 */
function isDiagramTypeSupported(code, diagramType) {
  // Currently only class diagrams are supported
  const lowerCode = code.toLowerCase();

  // Check if it's a class diagram
  const isClassDiagram = lowerCode.includes('classdiagram') ||
	                       (lowerCode.includes('@startuml') && (
	                           lowerCode.includes('class ') ||
	                           lowerCode.includes('interface ')
	                       ));

  // Exclude C4 diagrams (they use @startuml but are not class diagrams)
  if (isC4Diagram(code, diagramType)) {
    return false;
  }

  return isClassDiagram;
}

module.exports = {
  generateUnsupportedDescription,
  detectUnsupportedDiagramType,
  isDiagramTypeSupported,
  isC4Diagram,
  i18n
};
