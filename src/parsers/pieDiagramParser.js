/**
 * Pie Chart Parser for Mermaid
 * Parses Mermaid pie chart syntax and generates accessible descriptions
 */

/**
 * Parses a Mermaid pie chart
 * @param {string} content - The pie chart source code
 * @returns {object} Parsed pie chart data with title and segments
 */
function parseMermaidPieChart(content) {
  const lines = content.split('\n');
  
  let title = null;
  const segments = [];
  let inPieBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect pie chart start
    if (trimmed.startsWith('pie')) {
      inPieBlock = true;
      continue;
    }
    
    if (!inPieBlock || !trimmed || trimmed.startsWith('%%')) {
      continue;
    }
    
    // Check for title line (format: "title My Title")
    const titleMatch = trimmed.match(/^title\s+(.+?)$/);
    if (titleMatch) {
      title = titleMatch[1].trim();
      continue;
    }
    
    // Parse segment lines (format: "Label": value)
    // Also handles quoted labels with spaces
    const segmentMatch = trimmed.match(/^"([^"]+)"\s*:\s*(\d+(?:\.\d+)?)|^(\w+)\s*:\s*(\d+(?:\.\d+)?)/);
    
    if (segmentMatch) {
      const label = segmentMatch[1] || segmentMatch[3];
      const value = parseFloat(segmentMatch[2] || segmentMatch[4]);
      
      if (label && !isNaN(value)) {
        segments.push({
          label,
          value
        });
      }
    }
  }

  return {
    title,
    segments
  };
}

/**
 * Calculates percentage for each segment and formats it
 * @param {array} segments - Array of segments with values
 * @returns {array} Segments with calculated percentages
 */
function calculatePercentages(segments) {
  if (segments.length === 0) {
    return segments;
  }

  const sum = segments.reduce((acc, seg) => acc + seg.value, 0);
  
  return segments.map(segment => ({
    ...segment,
    percentage: sum > 0 ? Math.round((segment.value / sum) * 100) : 0
  }));
}

/**
 * Generates accessible description for pie chart
 * @param {object} parsed - Parsed pie chart data
 * @param {string} locale - 'en' or 'nl'
 * @returns {string} Natural language description
 */
function generateAccessibleDescription(parsed, locale = 'en') {
  const { title, segments } = parsed;
  
  if (!segments || segments.length === 0) {
    return locale === 'nl' 
      ? 'Taartdiagram zonder segmenten.'
      : 'Pie chart with no segments.';
  }

  const segmentsWithPercentages = calculatePercentages(segments);
  
  // Build title part
  let description = '';
  if (locale === 'nl') {
    if (title) {
      description = `Taartdiagram met titel "${title}" met ${segments.length} segment${segments.length === 1 ? '' : 'en'}.\n\n`;
    } else {
      description = `Taartdiagram met ${segments.length} segment${segments.length === 1 ? '' : 'en'}.\n\n`;
    }
  } else {
    if (title) {
      description = `Pie chart with title "${title}" showing ${segments.length} segment${segments.length === 1 ? '' : 's'}.\n\n`;
    } else {
      description = `Pie chart showing ${segments.length} segment${segments.length === 1 ? '' : 's'}.\n\n`;
    }
  }

  // Build segments list
  const segmentDescriptions = segmentsWithPercentages.map(seg => {
    return `${seg.label}: ${seg.value} (${seg.percentage}%)`;
  });

  description += segmentDescriptions.join('\n');

  return description;
}

/**
 * Generates HTML for aria-describedby
 * @param {object} parsed - Parsed pie chart data
 * @param {string} locale - 'en' or 'nl'
 * @returns {string} HTML for aria-describedby
 */
function generateAriaHtml(parsed, locale = 'en') {
  const description = generateAccessibleDescription(parsed, locale);
  const id = `pie-description-${Date.now()}`;
  
  return {
    id,
    html: `<div id="${id}" style="display:none;">${description}</div>`,
    description
  };
}

module.exports = {
  parseMermaidPieChart,
  generateAccessibleDescription,
  generateAriaHtml,
  calculatePercentages
};
