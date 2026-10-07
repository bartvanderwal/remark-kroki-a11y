/**
 * C4 Diagram Parser
 *
 * Parses PlantUML C4 context, container, and component diagrams and generates accessible descriptions.
 *
 * Context diagram format:
 *   Person(id, "Name", "Description")
 *   System(id, "Name", "Description")
 *   System_Ext(id, "Name", "Description")
 *   Rel(sourceId, targetId, "Label")
 *
 * Container diagram format:
 *   System_Boundary(id, "Name") { ... }
 *   Container(id, "Name", "Technology", "Description")
 *   ContainerDb(id, "Name", "Technology", "Description")
 *   Rel(sourceId, targetId, "Label")
 *
 * Component diagram format:
 *   Container_Boundary(id, "Name") { ... }
 *   Component(id, "Name", "Technology", "Description")
 *   Rel(sourceId, targetId, "Label")
 */

/**
 * Parse a C4 diagram (context or component)
 * @param {string} content - The PlantUML content
 * @returns {object} Parsed C4 structure
 */
function parseC4Context(content) {
  const actors = [];
  const systems = [];
  const components = [];
  const containers = [];
  const relationships = [];

  // Parse Person entries: Person(id, "Name", "Description")
  const personRegex = /Person\(\s*(\w+)\s*,\s*"([^"]+)"\s*,\s*"([^"]*)"\s*\)/g;
  let match;
  while ((match = personRegex.exec(content)) !== null) {
    actors.push({
      id: match[1],
      name: match[2],
      description: match[3]
    });
  }

  // Parse System entries: System(id, "Name", "Description")
  const systemRegex = /System\(\s*(\w+)\s*,\s*"([^"]+)"\s*,\s*"([^"]*)"\s*\)/g;
  while ((match = systemRegex.exec(content)) !== null) {
    systems.push({
      id: match[1],
      name: match[2],
      description: match[3],
      external: false
    });
  }

  // Parse System_Ext entries: System_Ext(id, "Name", "Description")
  const systemExtRegex = /System_Ext\(\s*(\w+)\s*,\s*"([^"]+)"\s*,\s*"([^"]*)"\s*\)/g;
  while ((match = systemExtRegex.exec(content)) !== null) {
    systems.push({
      id: match[1],
      name: match[2],
      description: match[3],
      external: true
    });
  }

  // Parse Container entries: Container(id, "Name", "Technology", "Description")
  const containerItemRegex = /Container\(\s*(\w+)\s*,\s*"([^"]+)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*\)/g;
  while ((match = containerItemRegex.exec(content)) !== null) {
    containers.push({
      id: match[1],
      name: match[2],
      technology: match[3],
      description: match[4],
      type: 'container'
    });
  }

  // Parse ContainerDb entries: ContainerDb(id, "Name", "Technology", "Description")
  const containerDbRegex = /ContainerDb\(\s*(\w+)\s*,\s*"([^"]+)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*\)/g;
  while ((match = containerDbRegex.exec(content)) !== null) {
    containers.push({
      id: match[1],
      name: match[2],
      technology: match[3],
      description: match[4],
      type: 'database'
    });
  }

  // Parse Container_Boundary entries: Container_Boundary(id, "Name")
  const containerBoundaryRegex = /Container_Boundary\(\s*(\w+)\s*,\s*"([^"]+)"\s*\)/g;
  while ((match = containerBoundaryRegex.exec(content)) !== null) {
    containers.push({
      id: match[1],
      name: match[2],
      type: 'boundary'
    });
  }

  // Parse System_Boundary entries: System_Boundary(id, "Name")
  const systemBoundaryRegex = /System_Boundary\(\s*(\w+)\s*,\s*"([^"]+)"\s*\)/g;
  while ((match = systemBoundaryRegex.exec(content)) !== null) {
    containers.push({
      id: match[1],
      name: match[2],
      type: 'system_boundary'
    });
  }

  // Parse Component entries: Component(id, "Name", "Technology", "Description")
  const componentRegex = /Component\(\s*(\w+)\s*,\s*"([^"]+)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*\)/g;
  while ((match = componentRegex.exec(content)) !== null) {
    components.push({
      id: match[1],
      name: match[2],
      technology: match[3],
      description: match[4]
    });
  }

  // Parse Relationships: Rel(sourceId, targetId, "Label")
  const relRegex = /Rel\(\s*(\w+)\s*,\s*(\w+)\s*,\s*"([^"]*)"\s*\)/g;
  while ((match = relRegex.exec(content)) !== null) {
    relationships.push({
      source: match[1],
      target: match[2],
      label: match[3]
    });
  }

  // Detect diagram type
  const hasContainerItems = containers.some(c => c.type === 'container' || c.type === 'database');
  const diagramType = components.length > 0 ? 'component' : hasContainerItems ? 'container' : 'context';

  return {
    diagramType,
    actors,
    systems,
    components,
    containers,
    relationships
  };
}

/**
 * Get name by ID (from actors, systems, containers, or components)
 */
function getNameById(id, actors, systems, components, containers) {
  const actor = actors.find(a => a.id === id);
  if (actor) return actor.name;

  const system = systems.find(s => s.id === id);
  if (system) return system.name;

  if (containers) {
    const container = containers.find(c => c.id === id);
    if (container) return container.name;
  }

  if (components) {
    const component = components.find(c => c.id === id);
    if (component) return component.name;
  }

  return id;
}

const { createTranslator } = require('../i18n.cjs');

/**
 * Generate accessible description as HTML with proper list structure
 */
function generateAccessibleDescription(parsed, locale = 'en', translations = {}) {
  if (parsed.diagramType === 'component') {
    return generateComponentDescription(parsed, locale, translations);
  }

  if (parsed.diagramType === 'container') {
    return generateContainerDescription(parsed, locale, translations);
  }

  return generateContextDescription(parsed, locale, translations);
}

/**
 * Generate description for C4 System Context diagrams
 */
function generateContextDescription(parsed, locale = 'en', translations = {}) {
  const t = createTranslator('c4', locale, translations);
  const { actors, systems, components, containers, relationships } = parsed;

  const internalSystems = systems.filter(s => !s.external);
  const externalSystems = systems.filter(s => s.external);

  const parts = [];

  parts.push(`<p>${t('context')}</p>`);

  parts.push('<ul>');

  // Actors summary
  if (actors.length === 0) {
    parts.push(`<li>${t('actors', { count: 0 })}</li>`);
  } else {
    const actorNames = actors.map(a => a.name).join(', ');
    parts.push(`<li>${t('actors', { count: actors.length })}: ${actorNames}</li>`);
  }

  // Systems summary
  const totalSystems = systems.length;
  if (totalSystems === 0) {
    parts.push(`<li>${t('systems', { count: 0 })}</li>`);
  } else if (totalSystems === 1) {
    parts.push(`<li>${t('systems', { count: 1 })}: ${systems[0].name}</li>`);
  } else {
    let systemItem = `<li>${t('systems', { count: totalSystems })}:`;
    systemItem += '<ul>';

    if (internalSystems.length > 0) {
      const internalNames = internalSystems.map(s => s.name).join(', ');
      systemItem += `<li>${t('internalSystems', { count: internalSystems.length })}: ${internalNames}</li>`;
    }

    if (externalSystems.length > 0) {
      const externalNames = externalSystems.map(s => s.name).join(', ');
      systemItem += `<li>${t('externalSystems', { count: externalSystems.length })}: ${externalNames}</li>`;
    }

    systemItem += '</ul></li>';
    parts.push(systemItem);
  }

  // Relationships summary
  if (relationships.length > 0) {
    let relItem = `<li>${t('relationships', { count: relationships.length })}:`;
    relItem += '<ul>';

    relationships.forEach(rel => {
      const sourceName = getNameById(rel.source, actors, systems, components, containers);
      const targetName = getNameById(rel.target, actors, systems, components, containers);
      const labelLowercase = rel.label.charAt(0).toLowerCase() + rel.label.slice(1);
      relItem += `<li>${sourceName} ${labelLowercase} ${targetName}</li>`;
    });

    relItem += '</ul></li>';
    parts.push(relItem);
  }

  parts.push('</ul>');

  return parts.join('\n');
}

/**
 * Generate description for C4 Container diagrams
 */
function generateContainerDescription(parsed, locale = 'en', translations = {}) {
  const t = createTranslator('c4', locale, translations);
  const { actors, systems, components, containers, relationships } = parsed;

  const containerItems = containers.filter(c => c.type === 'container' || c.type === 'database');
  const boundaries = containers.filter(c => c.type === 'system_boundary' || c.type === 'boundary');

  const parts = [];

  // Header with system boundary name if available
  if (boundaries.length > 0) {
    parts.push(`<p>${t('containerFor', { name: boundaries[0].name })}</p>`);
  } else {
    parts.push(`<p>${t('container')}</p>`);
  }

  parts.push('<ul>');

  // Actors summary
  if (actors.length > 0) {
    const actorNames = actors.map(a => a.name).join(', ');
    parts.push(`<li>${t('actors', { count: actors.length })}: ${actorNames}</li>`);
  }

  // Containers summary
  if (containerItems.length === 1) {
    const c = containerItems[0];
    const tech = c.technology ? ` (${c.technology})` : '';
    parts.push(`<li>${t('containers', { count: 1 })}: ${c.name}${tech}</li>`);
  } else if (containerItems.length > 1) {
    let containerItem = `<li>${t('containers', { count: containerItems.length })}:`;
    containerItem += '<ul>';

    containerItems.forEach(c => {
      const tech = c.technology ? ` (${c.technology})` : '';
      const typeLabel = c.type === 'database' ? ` [${t('database')}]` : '';
      containerItem += `<li>${c.name}${tech}${typeLabel}</li>`;
    });

    containerItem += '</ul></li>';
    parts.push(containerItem);
  }

  // External systems summary
  const externalSystems = systems.filter(s => s.external);
  if (externalSystems.length > 0) {
    const externalNames = externalSystems.map(s => s.name).join(', ');
    parts.push(`<li>${t('externalSystems', { count: externalSystems.length })}: ${externalNames}</li>`);
  }

  // Relationships summary
  if (relationships.length > 0) {
    let relItem = `<li>${t('relationships', { count: relationships.length })}:`;
    relItem += '<ul>';

    relationships.forEach(rel => {
      const sourceName = getNameById(rel.source, actors, systems, components, containers);
      const targetName = getNameById(rel.target, actors, systems, components, containers);
      const labelLowercase = rel.label.charAt(0).toLowerCase() + rel.label.slice(1);
      relItem += `<li>${sourceName} ${labelLowercase} ${targetName}</li>`;
    });

    relItem += '</ul></li>';
    parts.push(relItem);
  }

  parts.push('</ul>');

  return parts.join('\n');
}

/**
 * Generate description for C4 Component diagrams
 */
function generateComponentDescription(parsed, locale = 'en', translations = {}) {
  const t = createTranslator('c4', locale, translations);
  const { actors, systems, components, containers, relationships } = parsed;

  const boundaries = containers.filter(c => c.type === 'boundary');

  const parts = [];

  // Header with container name if available
  if (boundaries.length > 0) {
    parts.push(`<p>${t('componentFor', { name: boundaries[0].name })}</p>`);
  } else {
    parts.push(`<p>${t('component')}</p>`);
  }

  parts.push('<ul>');

  // Components summary
  if (components.length > 0) {
    const componentNames = components.map(c => c.name).join(', ');
    parts.push(`<li>${t('components', { count: components.length })}: ${componentNames}</li>`);
  }

  // Relationships summary
  if (relationships.length > 0) {
    let relItem = `<li>${t('relationships', { count: relationships.length })}:`;
    relItem += '<ul>';

    relationships.forEach(rel => {
      const sourceName = getNameById(rel.source, actors, systems, components, containers);
      const targetName = getNameById(rel.target, actors, systems, components, containers);
      const labelLowercase = rel.label.charAt(0).toLowerCase() + rel.label.slice(1);
      relItem += `<li>${sourceName} ${labelLowercase} ${targetName}</li>`;
    });

    relItem += '</ul></li>';
    parts.push(relItem);
  }

  parts.push('</ul>');

  return parts.join('\n');
}

/**
 * Generate ARIA HTML (visually hidden)
 */
function generateAriaHtml(parsed, locale = 'en', translations = {}) {
  const t = createTranslator('c4', locale, translations);
  const description = generateAccessibleDescription(parsed, locale, translations);
  const escapedDescription = description
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  const ariaLabel = t('ariaLabel')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<div style="display: none;" role="doc-footnote" aria-label="${ariaLabel}">${escapedDescription}</div>`;
}

module.exports = {
  parseC4Context,
  generateAccessibleDescription,
  generateAriaHtml
};
