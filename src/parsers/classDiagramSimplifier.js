const { parsePlantUMLClassDiagram } = require('./classDiagramParser');

function renderAttribute(attribute, options = {}) {
  const visibility = attribute.visibility || '+';
  const name = attribute.name || '';
  const hideType = Boolean(options.hideType);
  const addPadding = Boolean(options.addPadding);
  const withType = attribute.type ? `${visibility}${name} : ${attribute.type}` : `${visibility}${name}`;

  if (hideType) {
    const withoutType = `${visibility}${name}`;
    if (addPadding && attribute.type) {
      // Keep approximate visual width by padding based on hidden type-signature length.
      const paddingLength = Math.max(1, withType.length - withoutType.length);
      return `${withoutType}${'\u00A0'.repeat(paddingLength)}`;
    }
    return withoutType;
  }

  return withType;
}

function renderMethod(method) {
  const visibility = method.visibility || '+';
  const name = method.name || '';
  const params = (method.parameters || [])
    .map((parameter) => {
      if (!parameter.type || parameter.type === 'unknown') {
        return parameter.name;
      }
      return `${parameter.name} : ${parameter.type}`;
    })
    .join(', ');
  const returnType = method.returnType || 'void';
  return `${visibility}${name}(${params}) : ${returnType}`;
}

function isIdAttribute(attribute) {
  if (!attribute || !attribute.name) return false;
  return attribute.name.trim().toLowerCase() === 'id';
}

function classKeywordFor(stereotype) {
  const normalized = stereotype ? stereotype.toLowerCase() : '';
  if (normalized === 'interface') return 'interface';
  if (normalized === 'abstract') return 'abstract class';
  return 'class';
}

const relationLegendDictionary = {
  en: {
    '-->': { name: 'association', glyph: '→' },
    '..>': { name: 'dependency', glyph: '⇢' },
    'o-->': { name: 'aggregation', glyph: '◇→' },
    '*-->': { name: 'composition', glyph: '◆→' },
    '--|>': { name: 'inheritance', glyph: '△' },
    '..|>': { name: 'implementation', glyph: '⇢△' },
  },
  nl: {
    '-->': { name: 'associatie', glyph: '→' },
    '..>': { name: 'dependency', glyph: '⇢' },
    'o-->': { name: 'aggregatie', glyph: '◇→' },
    '*-->': { name: 'compositie', glyph: '◆→' },
    '--|>': { name: 'overerving', glyph: '△' },
    '..|>': { name: 'implementatie', glyph: '⇢△' },
  },
};

function relationArrowForType(type, simplifyRelations) {
  if (simplifyRelations) return '-->';
  if (type === 'dependency') return '..>';
  if (type === 'aggregation') return 'o-->';
  if (type === 'composition') return '*-->';
  if (type === 'inheritance') return '--|>';
  if (type === 'implementation') return '..|>';
  return '-->';
}

function legendContent(usedArrows, locale) {
  const language = locale === 'nl' ? 'nl' : 'en';
  const dictionary = relationLegendDictionary[language] || relationLegendDictionary.en;
  const entries = [];

  for (const arrow of ['..>', '..|>', '*-->', 'o-->', '--|>', '-->']) {
    if (!usedArrows.has(arrow)) continue;
    const entry = dictionary[arrow];
    if (!entry) continue;
    entries.push(`${entry.glyph} : ${entry.name}`);
  }

  return entries;
}

function appendLegend(lines, usedArrows, locale) {
  const legendLines = legendContent(usedArrows, locale);
  if (legendLines.length === 0) return;
  lines.push('legend right');
  lines.push(`  <b>${locale === 'nl' ? 'Relaties' : 'Relations'}</b>`);
  for (const line of legendLines) {
    lines.push(`  ${line}`);
  }
  lines.push('endlegend');
}

function isToManyMultiplicity(multiplicity) {
  if (!multiplicity) return false;
  const normalized = String(multiplicity).toLowerCase();
  return normalized.includes('*') || normalized.includes('n');
}

function toAttributeName(value) {
  if (!value) return 'related';
  const cleaned = value.replace(/[^a-zA-Z0-9_]/g, '');
  if (!cleaned) return 'related';
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

function ensureUniqueAttributeName(attributes, preferredName) {
  const usedNames = new Set((attributes || []).map((attribute) => attribute.name));
  if (!usedNames.has(preferredName)) return preferredName;

  let counter = 2;
  while (usedNames.has(`${preferredName}${counter}`)) {
    counter += 1;
  }
  return `${preferredName}${counter}`;
}

function cloneParsed(parsed) {
  return JSON.parse(JSON.stringify(parsed));
}

function addRelationAttributesForDevMode(parsed) {
  for (const relation of parsed.relations) {
    if (relation.type === 'dependency') continue;
    if (!relation.from || !relation.to) continue;
    if (!parsed.classes[relation.from] || !parsed.classes[relation.to]) continue;

    const ownerClass = parsed.classes[relation.from];
    ownerClass.attributes = ownerClass.attributes || [];

    const labelBasedName = relation.label ? toAttributeName(relation.label) : null;
    const baseName = labelBasedName || toAttributeName(relation.to);
    const typeName = isToManyMultiplicity(relation.multiplicityTo) ? `${relation.to}[]` : relation.to;

    const alreadyExists = ownerClass.attributes.some((attribute) =>
      attribute.name === baseName && attribute.type === typeName
    );
    if (alreadyExists) continue;

    const uniqueName = ensureUniqueAttributeName(ownerClass.attributes, baseName);
    ownerClass.attributes.push({
      visibility: '-',
      name: uniqueName,
      type: typeName,
    });
  }

  return parsed;
}

function renderPlantUMLClassDiagram(parsed, options = {}) {
  const classNames = Object.keys(parsed.classes);
  if (classNames.length === 0) {
    return null;
  }

  const lines = ['@startuml'];

  for (const className of classNames) {
    const classData = parsed.classes[className];
    const classKeyword = classKeywordFor(classData.stereotype);
    lines.push(`${classKeyword} ${className} {`);

    const attributes = (classData.attributes || []).filter((attribute) => {
      if (!options.removeIdAttributes) return true;
      return !isIdAttribute(attribute);
    });
    const methods = classData.methods || [];
    

    for (const attribute of attributes) {
      lines.push(`  ${renderAttribute(attribute, {
        hideType: Boolean(options.hideAttributeTypes),
        addPadding: Boolean(options.padSimplifiedAttributes),
      })}`);
    }

    for (const method of methods) {
      lines.push(`  ${renderMethod(method)}`);
    }

    // Add invisible padding lines to match height of the dev-mode variant,
    // which has extra relation-attribute rows and keeps id attributes.
    if (options.devModeExtraAttributeCounts) {
      const paddingCount = options.devModeExtraAttributeCounts[className] || 0;
      for (let i = 0; i < paddingCount; i++) {
        lines.push('  <size:1> </size>');
      }
    }

    lines.push('}');
  }

  const usedArrows = new Set();

  for (const relation of parsed.relations) {
    const relationArrow = relationArrowForType(relation.type, options.simplifyRelations);
    usedArrows.add(relationArrow);

    let relationLine = `${relation.from} ${relationArrow} ${relation.to}`;
    if (relation.label) {
      relationLine += ` : ${relation.label}`;
    }
    lines.push(relationLine);
  }

  for (const note of parsed.notes || []) {
    lines.push(`note right of ${note.className} : ${note.text}`);
  }

  if (options.showLegend) {
    appendLegend(lines, usedArrows, options.locale || 'en');
  }

  lines.push('@enduml');
  return lines.join('\n');
}

function simplifyPlantUMLClassDiagram(source, options = {}) {
  const parsed = parsePlantUMLClassDiagram(source);

  // Calculate how many extra attribute rows the dev-mode variant has per class,
  // so the simpler variant can add invisible padding to keep class box heights equal.
  const parsedWithDevAttrs = addRelationAttributesForDevMode(cloneParsed(parsed));
  const devModeExtraAttributeCounts = {};
  const devModeAttributeLengths = {};
  for (const className of Object.keys(parsed.classes)) {
    const originalAttrs = parsed.classes[className].attributes || [];
    const devAttrs = parsedWithDevAttrs.classes[className]?.attributes || [];
    // dev mode keeps id attrs; simpler removes them — count both differences
    const idCount = originalAttrs.filter(isIdAttribute).length;
    const relationAttrCount = devAttrs.length - originalAttrs.length;
    devModeExtraAttributeCounts[className] = idCount + relationAttrCount;
    
    // Bereken langste attribuut/type-string uit dev-modus
    let maxLength = 0;
    for (const attr of devAttrs) {
      const withType = attr.type ? `${attr.visibility || '+'}${attr.name} : ${attr.type}` : `${attr.visibility || '+'}${attr.name}`;
      if (withType.length > maxLength) maxLength = withType.length;
    }
    devModeAttributeLengths[className] = maxLength;
  }

  return renderPlantUMLClassDiagram(parsed, {
    simplifyRelations: true,
    removeIdAttributes: true,
    hideAttributeTypes: true,
    padSimplifiedAttributes: true,
    devModeExtraAttributeCounts,
    devModeAttributeLengths,
    showLegend: false,
    legendMode: 'simpler',
    locale: options.locale || 'en',
  });
}

function generateDevModePlantUMLClassDiagram(source, options = {}) {
  const parsed = parsePlantUMLClassDiagram(source);
  const withRelationAttributes = addRelationAttributesForDevMode(cloneParsed(parsed));
  return renderPlantUMLClassDiagram(withRelationAttributes, {
    simplifyRelations: false,
    removeIdAttributes: false,
    showLegend: Boolean(options.showLegend),
    legendMode: 'dev',
    locale: options.locale || 'en',
  });
}

module.exports = {
  generateDevModePlantUMLClassDiagram,
  simplifyPlantUMLClassDiagram,
};
