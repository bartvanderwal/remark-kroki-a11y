/**
 * C4 Context Diagram Parser
 * 
 * Parses PlantUML C4 context diagrams and generates accessible descriptions.
 * 
 * Format:
 *   Person(id, "Name", "Description")
 *   System(id, "Name", "Description")
 *   System_Ext(id, "Name", "Description")
 *   Rel(sourceId, targetId, "Label")
 * 
 * Example:
 *   Person(user, "User", "A person")
 *   System(app, "Application", "Main app")
 *   Rel(user, app, "Uses")
 */

/**
 * Parse a C4 context diagram
 * @param {string} content - The PlantUML content
 * @returns {object} Parsed C4 structure
 */
function parseC4Context(content) {
  const actors = [];
  const systems = [];
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

  // Parse Relationships: Rel(sourceId, targetId, "Label")
  const relRegex = /Rel\(\s*(\w+)\s*,\s*(\w+)\s*,\s*"([^"]*)"\s*\)/g;
  while ((match = relRegex.exec(content)) !== null) {
    relationships.push({
      source: match[1],
      target: match[2],
      label: match[3]
    });
  }

  return {
    actors,
    systems,
    relationships
  };
}

/**
 * Get name by ID (from actors or systems)
 */
function getNameById(id, actors, systems) {
  const actor = actors.find(a => a.id === id);
  if (actor) return actor.name;
  
  const system = systems.find(s => s.id === id);
  if (system) return system.name;
  
  return id;
}

/**
 * Generate accessible description in English
 */
function generateAccessibleDescription(parsed, locale = 'en') {
  const { actors, systems, relationships } = parsed;
  
  const internalSystems = systems.filter(s => !s.external);
  const externalSystems = systems.filter(s => s.external);
  
  let description = 'C4 System Context diagram with:\n\n';
  
  // Actors summary
  if (actors.length === 0) {
    description += '- 0 actors\n';
  } else if (actors.length === 1) {
    description += `- 1 actor: ${actors[0].name}\n`;
  } else {
    const actorNames = actors.map(a => a.name).join(', ');
    description += `- ${actors.length} actors: ${actorNames}\n`;
  }
  
  // Systems summary
  const totalSystems = systems.length;
  if (totalSystems === 0) {
    description += '- 0 systems\n';
  } else if (totalSystems === 1 && internalSystems.length === 1) {
    // Single internal system - just say "1 system:"
    description += `- 1 system: ${systems[0].name}\n`;
  } else if (totalSystems === 1) {
    // Single external system - just say "1 system:"
    description += `- 1 system: ${systems[0].name}\n`;
  } else {
    description += `- ${totalSystems} systems:\n`;
    
    if (internalSystems.length > 0) {
      const internalNames = internalSystems.map(s => s.name).join(', ');
      if (internalSystems.length === 1) {
        description += `  - 1 internal system: ${internalNames}\n`;
      } else {
        description += `  - ${internalSystems.length} internal systems: ${internalNames}\n`;
      }
    }
    
    if (externalSystems.length > 0) {
      const externalNames = externalSystems.map(s => s.name).join(', ');
      if (externalSystems.length === 1) {
        description += `  - 1 external system: ${externalNames}\n`;
      } else {
        description += `  - ${externalSystems.length} external systems: ${externalNames}\n`;
      }
    }
  }
  
  // Relationships summary
  if (relationships.length > 0) {
    description += `\n- ${relationships.length} relationship`;
    if (relationships.length > 1) description += 's';
    description += ':\n';
    
    relationships.forEach(rel => {
      const sourceName = getNameById(rel.source, actors, systems);
      const targetName = getNameById(rel.target, actors, systems);
      // Convert label to lowercase (prepositions like 'to', 'through', 'on' should be in the label already)
      const labelLowercase = rel.label.charAt(0).toLowerCase() + rel.label.slice(1);
      description += `  • ${sourceName} ${labelLowercase} ${targetName}\n`;
    });
  }
  
  return description;
}

/**
 * Generate ARIA HTML (visually hidden)
 */
function generateAriaHtml(parsed, locale = 'en') {
  const description = generateAccessibleDescription(parsed, locale);
  const escapedDescription = description
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  return `<div style="display: none;" role="doc-footnote" aria-label="System context description">${escapedDescription}</div>`;
}

module.exports = {
  parseC4Context,
  generateAccessibleDescription,
  generateAriaHtml
};
