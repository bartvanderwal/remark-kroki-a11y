import runtime from './a11yRuntime.cjs';

export const parserRegistry = runtime.parserRegistry;
export const tryGenerateA11yDescription = runtime.tryGenerateA11yDescription;
export const detectPlantUMLDiagramType = runtime.detectPlantUMLDiagramType;
export const detectMermaidDiagramType = runtime.detectMermaidDiagramType;
export const diagramTypeNames = runtime.diagramTypeNames;
export const languageNames = runtime.languageNames;
export const defaultFallbackA11yText = runtime.defaultFallbackA11yText;
export const uiLabels = runtime.uiLabels;
export const extractTextContent = runtime.extractTextContent;
export const generateA11yFromSource = runtime.generateA11yFromSource;

export default runtime;
