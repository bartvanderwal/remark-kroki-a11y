const { parsePlantUMLStateDiagram, generateAccessibleDescription: generateStateDescription } = require('../parsers/stateDiagramParser.cjs');
const { parseMermaidClassDiagram, parsePlantUMLClassDiagram, generateAccessibleDescription: generateClassDescription } = require('../parsers/classDiagramParser.cjs');
const { parseMermaidSequenceDiagram, generateAccessibleDescription: generateSequenceDescription } = require('../parsers/sequenceDiagramParser.cjs');
const { parsePlantUMLActivityDiagram, generateAccessibleDescription: generateActivityDescription } = require('../parsers/activityDiagramParser.cjs');
const { parseC4Context, generateAccessibleDescription: generateC4Description } = require('../parsers/c4DiagramParser.cjs');
const { parseMermaidPieChart, generateAccessibleDescription: generatePieDescription } = require('../parsers/pieDiagramParser.cjs');
const { parseDomainStory, generateAccessibleDescription: generateDomainStoryDescription } = require('../parsers/domainStoryParser.cjs');
const { createTranslator, getMessages, formatFallback } = require('../i18n.cjs');

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
    name: 'PlantUML Domain Story',
    canParse: (imgType, diagramType, content) => {
      if (imgType !== 'plantuml') return false;
      if (diagramType === 'domainStory') return true;
      const lower = content.toLowerCase();
      return lower.includes('<domainstory/domainstory>') ||
        lower.includes('!include domainstory.puml') ||
        /\bactivity\s*\(/.test(content);
    },
    parse: parseDomainStory,
    generate: generateDomainStoryDescription,
  },
  {
    name: 'PlantUML Sequence Diagram',
    canParse: (imgType, diagramType) => imgType === 'plantuml' && diagramType === 'sequenceDiagram',
    parse: parseMermaidSequenceDiagram,
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

function tryGenerateA11yDescription(imgType, diagramType, content, locale, translations = {}) {
  for (const parser of parserRegistry) {
    if (parser.canParse(imgType, diagramType, content)) {
      try {
        const parsed = parser.parse(content);
        return parser.generate(parsed, locale, translations);
      } catch (e) {
        console.warn(`Failed to parse ${parser.name} for a11y:`, e.message);
      }
    }
  }
  return null;
}

function detectPlantUMLDiagramType(content) {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('<domainstory/domainstory>') ||
      lowerContent.includes('!include domainstory.puml') ||
      /\bactivity\s*\(/.test(content)) {
    return 'domainStory';
  }
  if (lowerContent.includes('c4_context') || lowerContent.includes('c4_component') ||
      lowerContent.includes('c4_container') || lowerContent.includes('c4-plantuml') ||
      /\bperson\s*\(/.test(lowerContent) || /\bsystem\s*\(/.test(lowerContent) ||
      /\bsystem_ext\s*\(/.test(lowerContent) || /\bcontainer\s*\(/.test(lowerContent) ||
      /\brel\s*\(/.test(lowerContent)) {
    return 'c4Diagram';
  }
  if (lowerContent.includes('statediagram') || (lowerContent.includes('@startuml') && lowerContent.includes('-->'))) {
    if (lowerContent.includes('[*]') || lowerContent.includes('state ')) {
      return 'stateDiagram';
    }
  }
  if (lowerContent.includes('class ') || lowerContent.includes('interface ')) return 'classDiagram';
  if (lowerContent.includes('actor ') || lowerContent.includes('participant ')) return 'sequenceDiagram';
  if (/\w+\s*-+>\s*\w+/.test(lowerContent)) return 'sequenceDiagram';
  if (lowerContent.includes('entity ')) return 'erDiagram';
  if (lowerContent.includes('component ')) return 'componentDiagram';
  if (lowerContent.includes('usecase ')) return 'usecaseDiagram';
  if (/:\s*[^;]+;/.test(content) ||
      /\bstart\b/.test(lowerContent) || /\bstop\b/.test(lowerContent) ||
      lowerContent.includes('while ') || lowerContent.includes('repeat') ||
      lowerContent.includes('fork') || lowerContent.includes('split')) return 'activityDiagram';
  return 'diagram';
}

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

const diagramTypeNames = getMessages('diagramTypes');

const languageNames = {
  kroki: 'Diagram',
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

const uiLabels = getMessages('ui');
const defaultFallbackA11yText = Object.fromEntries(
  Object.entries(uiLabels).map(([locale, messages]) => [locale, messages.fallbackA11yText])
);

function extractTextContent(html) {
  return html
    .replace(/<\/li>/g, '. ')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .trim();
}

function generateA11yFromSource({ imgType, content, locale = 'en', translations = {}, fallbackA11yText = {} }) {
  const diagramType = imgType === 'plantuml'
    ? detectPlantUMLDiagramType(content)
    : imgType === 'mermaid'
      ? detectMermaidDiagramType(content)
      : 'diagram';

  let a11yDescription = tryGenerateA11yDescription(imgType, diagramType, content, locale, translations);
  if (!a11yDescription) {
    const diagramTypeName = createTranslator('diagramTypes', locale, translations)(diagramType);
    a11yDescription = formatFallback(locale, diagramTypeName, translations, fallbackA11yText);
  }

  return {
    diagramType,
    a11yDescription,
    a11yText: extractTextContent(a11yDescription),
  };
}

module.exports = {
  parserRegistry,
  tryGenerateA11yDescription,
  detectPlantUMLDiagramType,
  detectMermaidDiagramType,
  diagramTypeNames,
  languageNames,
  defaultFallbackA11yText,
  uiLabels,
  extractTextContent,
  generateA11yFromSource,
};
