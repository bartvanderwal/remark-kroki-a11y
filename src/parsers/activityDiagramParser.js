/**
 * Activity Diagram Parser (PlantUML)
 *
 * Parses PlantUML activity diagram syntax and generates structured accessible descriptions.
 * Uses begin/end markers instead of numbering so screen reader users can track nesting.
 *
 * Output format example:
 * "Activiteitendiagram met 2 activiteiten en 1 beslispunt.
 * Stroom:
 * Start
 * Beslissing: Graphviz installed?
 *    - Ja: process all diagrams
 *    - Nee: process only sequence and activity diagrams
 * Stop"
 */

// Localization strings
const i18n = {
  nl: {
    activityDiagram: 'Activiteitendiagram',
    withActivities: 'met {count} activiteiten',
    withActivity: 'met {count} activiteit',
    andDecisionPoints: 'en {count} beslispunten',
    andDecisionPoint: 'en {count} beslispunt',
    withPartitions: 'met {count} partities',
    withPartition: 'met {count} partitie',
    flow: 'Flow',
    step: 'Stap',
    start: 'Start',
    stop: 'Stop',
    end: 'Einde',
    decision: 'Beslissing',
    yes: 'Ja',
    no: 'Nee',
    partition: 'Partitie',
    endPartition: 'Einde partitie',
    repeatWhile: 'Herhaal zolang',
    repeatDoWhile: 'Herhaal zolang',
    endRepeat: 'Einde herhaling',
    parallelExecution: 'Parallelle uitvoering',
    endParallelExecution: 'Einde parallelle uitvoering',
    branch: 'Tak',
    consistingOf: 'bestaande uit',
  },
  en: {
    activityDiagram: 'Activity diagram',
    withActivities: 'with {count} activities',
    withActivity: 'with {count} activity',
    andDecisionPoints: 'and {count} decision points',
    andDecisionPoint: 'and {count} decision point',
    withPartitions: 'with {count} partitions',
    withPartition: 'with {count} partition',
    flow: 'Flow',
    step: 'Step',
    start: 'Start',
    stop: 'Stop',
    end: 'End',
    decision: 'Decision',
    yes: 'Yes',
    no: 'No',
    partition: 'Partition',
    endPartition: 'End partition',
    repeatWhile: 'Repeat while',
    repeatDoWhile: 'Repeat while',
    endRepeat: 'End repeat',
    parallelExecution: 'Parallel execution',
    endParallelExecution: 'End parallel execution',
    branch: 'Branch',
    consistingOf: 'consisting of',
  }
};

/**
 * Parse PlantUML activity diagram
 * @param {string} content - The PlantUML diagram content
 * @returns {object} Parsed diagram structure
 */
function parsePlantUMLActivityDiagram(content) {
  const lines = content.split('\n');
  const elements = [];
  let currentPartition = null;
  let partitionElements = [];
  let insideIf = false;
  let ifCondition = null;
  let ifBranches = { yes: [], no: [] };
  let currentBranch = null;
  let insideWhile = false;
  let whileCondition = null;
  let whileConditionValue = null;
  let whileElements = [];
  // Stack-based fork handling to support nested forks
  const forkStack = [];  // Each entry: { branches: [...], currentBranch: [...] }
  let insideRepeat = false;
  let repeatElements = [];
  let multiLineActivity = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines, comments, directives
    if (!trimmed || trimmed.startsWith("'") || trimmed.startsWith('!') ||
		    trimmed.startsWith('@startuml') || trimmed.startsWith('@enduml') ||
		    trimmed.startsWith('title') || trimmed.startsWith('skinparam') ||
		    trimmed.startsWith('note') || trimmed.startsWith('end note')) {
      continue;
    }

    // Helper: push element into the correct context
    function pushElement(element) {
      if (forkStack.length > 0) {
        forkStack[forkStack.length - 1].currentBranch.push(element);
      } else if (insideRepeat) {
        repeatElements.push(element);
      } else if (insideWhile) {
        whileElements.push(element);
      } else if (insideIf) {
        ifBranches[currentBranch].push(element);
      } else if (currentPartition) {
        partitionElements.push(element);
      } else {
        elements.push(element);
      }
    }

    // Start node
    if (trimmed === 'start') {
      pushElement({ type: 'start' });
      continue;
    }

    // Stop/end node
    if (trimmed === 'stop' || trimmed === 'end') {
      pushElement({ type: trimmed });
      continue;
    }

    // Partition start: partition "Name" {
    const partitionMatch = trimmed.match(/^partition\s+"([^"]+)"\s*\{?$/);
    if (partitionMatch) {
      currentPartition = partitionMatch[1];
      partitionElements = [];
      continue;
    }

    // Partition end: }
    if (trimmed === '}' && currentPartition) {
      elements.push({
        type: 'partition',
        name: currentPartition,
        elements: partitionElements
      });
      currentPartition = null;
      partitionElements = [];
      continue;
    }

    // If statement: if (condition?) then (yes)
    const ifMatch = trimmed.match(/^if\s*\(([^)]+)\)\s*then\s*\(([^)]+)\)$/);
    if (ifMatch) {
      insideIf = true;
      ifCondition = ifMatch[1];
      currentBranch = 'yes';
      ifBranches = { yes: [], no: [] };
      continue;
    }

    // Else branch: else (no)
    const elseMatch = trimmed.match(/^else\s*\(([^)]+)\)$/);
    if (elseMatch && insideIf) {
      currentBranch = 'no';
      continue;
    }

    // End if: endif
    if (trimmed === 'endif' && insideIf) {
      const closedCondition = ifCondition;
      const closedBranches = ifBranches;
      insideIf = false;
      ifCondition = null;
      ifBranches = { yes: [], no: [] };
      currentBranch = null;
      pushElement({
        type: 'decision',
        condition: closedCondition,
        yesBranch: closedBranches.yes,
        noBranch: closedBranches.no
      });
      continue;
    }

    // While loop: while (condition?) is (value)
    // Also support: while () is (value) — empty condition
    const whileMatch = trimmed.match(/^while\s*\(([^)]*)\)\s*is\s*\(([^)]+)\)$/);
    if (whileMatch) {
      insideWhile = true;
      whileCondition = whileMatch[1] || null;
      whileConditionValue = whileMatch[2];
      whileElements = [];
      continue;
    }

    // End while: endwhile (text)
    const endWhileMatch = trimmed.match(/^endwhile\s*\(([^)]+)\)$/);
    if (endWhileMatch && insideWhile) {
      const closedElements = whileElements;
      const closedCondition = whileCondition;
      const closedValue = whileConditionValue;
      const exitCondition = endWhileMatch[1];
      insideWhile = false;
      whileCondition = null;
      whileConditionValue = null;
      whileElements = [];
      pushElement({
        type: 'while',
        condition: closedCondition,
        conditionValue: closedValue,
        exitCondition: exitCondition,
        elements: closedElements
      });
      continue;
    }

    // Repeat (do-while): repeat
    if (trimmed === 'repeat' && !insideRepeat) {
      insideRepeat = true;
      repeatElements = [];
      continue;
    }

    // End repeat: repeat while (condition)
    const repeatWhileMatch = trimmed.match(/^repeat\s+while\s*\(([^)]+)\)$/);
    if (repeatWhileMatch && insideRepeat) {
      const closedElements = repeatElements;
      const condition = repeatWhileMatch[1];
      insideRepeat = false;
      repeatElements = [];
      pushElement({
        type: 'repeat',
        condition: condition,
        elements: closedElements
      });
      continue;
    }

    // Fork (parallel): fork - supports nesting via stack
    if (trimmed === 'fork') {
      forkStack.push({ branches: [], currentBranch: [] });
      continue;
    }

    // Fork again: fork again
    if (trimmed === 'fork again' && forkStack.length > 0) {
      const current = forkStack[forkStack.length - 1];
      current.branches.push(current.currentBranch);
      current.currentBranch = [];
      continue;
    }

    // End fork: end fork
    if (trimmed === 'end fork' && forkStack.length > 0) {
      const closed = forkStack.pop();
      closed.branches.push(closed.currentBranch);
      pushElement({
        type: 'fork',
        branches: closed.branches
      });
      continue;
    }

    // Split (parallel, same semantics as fork): split - supports nesting via stack
    if (trimmed === 'split') {
      forkStack.push({ branches: [], currentBranch: [] });
      continue;
    }

    // Split again: split again
    if (trimmed === 'split again' && forkStack.length > 0) {
      const current = forkStack[forkStack.length - 1];
      current.branches.push(current.currentBranch);
      current.currentBranch = [];
      continue;
    }

    // End split: end split
    if (trimmed === 'end split' && forkStack.length > 0) {
      const closed = forkStack.pop();
      closed.branches.push(closed.currentBranch);
      pushElement({
        type: 'fork',
        branches: closed.branches
      });
      continue;
    }

    // Multi-line activity: starts with : but no ; on same line
    if (trimmed.startsWith(':') && !trimmed.endsWith(';')) {
      multiLineActivity = trimmed.substring(1);  // Remove leading :
      continue;
    }

    // Continuation of multi-line activity
    if (multiLineActivity !== null) {
      if (trimmed.endsWith(';')) {
        // End of multi-line activity
        multiLineActivity += ' ' + trimmed.slice(0, -1);  // Remove trailing ;
        const activityText = multiLineActivity
          .replace(/\\n/g, ' ')
          .replace(/__([^_]+)__/g, '$1')
          .trim();
        pushElement({ type: 'activity', text: activityText });
        multiLineActivity = null;
      } else {
        multiLineActivity += ' ' + trimmed;
      }
      continue;
    }

    // Activity: :text; (single line)
    const activityMatch = trimmed.match(/^:([^;]+);$/);
    if (activityMatch) {
      const activityText = activityMatch[1]
        .replace(/\\n/g, ' ')
        .replace(/__([^_]+)__/g, '$1')
        .trim();
      pushElement({ type: 'activity', text: activityText });
      continue;
    }
  }

  // Count statistics
  let activityCount = 0;
  let decisionCount = 0;
  let partitionCount = 0;

  function countElements(els) {
    for (const el of els) {
      if (el.type === 'activity') activityCount++;
      if (el.type === 'decision') {
        decisionCount++;
        countElements(el.yesBranch);
        countElements(el.noBranch);
      }
      if (el.type === 'partition') {
        partitionCount++;
        countElements(el.elements);
      }
      if (el.type === 'while') {
        countElements(el.elements);
      }
      if (el.type === 'repeat') {
        countElements(el.elements);
      }
      if (el.type === 'fork') {
        for (const branch of el.branches) {
          countElements(branch);
        }
      }
    }
  }
  countElements(elements);

  return {
    elements,
    activityCount,
    decisionCount,
    partitionCount
  };
}

/**
 * Extract partition letter from partition name (e.g., "A: Reis naar oma" -> "A")
 * @param {string} name - The partition name
 * @returns {string} The letter prefix, or empty string if not found
 */
function extractPartitionLetter(name) {
  const match = name.match(/^([A-Z]):/);
  return match ? match[1] : '';
}

/**
 * Extract partition title from partition name (e.g., "A: Reis naar oma" -> "Reis naar oma")
 * @param {string} name - The partition name
 * @returns {string} The title part after the colon
 */
function extractPartitionTitle(name) {
  const match = name.match(/^[A-Z]:\s*(.+)$/);
  return match ? match[1] : name;
}

/**
 * Generate accessible description from parsed activity diagram.
 * Uses begin/end markers with numbered parallel blocks for screen reader navigation.
 * No step numbering - uses "Stap." prefix without numbers.
 *
 * @param {object} parsed - Parsed diagram structure
 * @param {string} locale - Locale for output ('nl' or 'en')
 * @returns {string} HTML description
 */
function generateAccessibleDescription(parsed, locale = 'nl') {
  const t = i18n[locale] || i18n.nl;
  const parts = [];

  // First line: summary
  let summary = t.activityDiagram;

  if (parsed.partitionCount > 0) {
    summary += ' ' + (parsed.partitionCount === 1
      ? t.withPartition.replace('{count}', parsed.partitionCount)
      : t.withPartitions.replace('{count}', parsed.partitionCount));
    summary += ' ' + (locale === 'nl' ? 'en' : 'and');
    summary += ` ${parsed.activityCount} ` + (parsed.activityCount === 1
      ? (locale === 'nl' ? 'activiteit' : 'activity')
      : (locale === 'nl' ? 'activiteiten' : 'activities'));
  } else {
    summary += ' ' + (parsed.activityCount === 1
      ? t.withActivity.replace('{count}', parsed.activityCount)
      : t.withActivities.replace('{count}', parsed.activityCount));
  }

  if (parsed.decisionCount > 0) {
    summary += ' ' + (parsed.decisionCount === 1
      ? t.andDecisionPoint.replace('{count}', parsed.decisionCount)
      : t.andDecisionPoints.replace('{count}', parsed.decisionCount));
  }

  parts.push(`<p>${summary}.</p>`);

  // Flow section
  parts.push(`<p><strong>${t.flow}:</strong></p>`);

  // Global counter for parallel execution numbering (to disambiguate nested forks)
  let forkCounter = 0;

  /**
	 * Format elements for output - no step numbering, with begin/end markers
	 * @param {Array} elements - Elements to format
	 * @returns {Array} Formatted lines
	 */
  function formatElements(elements) {
    const result = [];

    for (const el of elements) {
      if (el.type === 'start') {
        result.push(t.start);
      } else if (el.type === 'stop') {
        result.push(t.stop);
      } else if (el.type === 'end') {
        result.push(t.end);
      } else if (el.type === 'activity') {
        result.push(`${t.step}. ${el.text}`);
      } else if (el.type === 'decision') {
        result.push(`${t.decision}: ${el.condition}`);
        if (el.yesBranch.length > 0) {
          const yesText = el.yesBranch
            .filter(e => e.type === 'activity')
            .map(e => `${t.step}. ${e.text}`)
            .join(', ') || '';
          if (yesText) {
            result.push(`   - ${t.yes}: ${yesText}`);
          }
        }
        if (el.noBranch.length > 0) {
          const noText = el.noBranch
            .filter(e => e.type === 'activity')
            .map(e => `${t.step}. ${e.text}`)
            .join(', ') || '';
          if (noText) {
            result.push(`   - ${t.no}: ${noText}`);
          }
        }
      } else if (el.type === 'partition') {
        const letter = extractPartitionLetter(el.name);
        const title = extractPartitionTitle(el.name);
        if (letter) {
          result.push(`${t.partition} ${letter}: ${title}, ${t.consistingOf}:`);
        } else {
          result.push(`${t.partition}: ${el.name}, ${t.consistingOf}:`);
        }
        const subElements = formatElements(el.elements);
        result.push(...subElements.map(line => `   ${line}`));
        if (letter) {
          result.push(`${t.endPartition} ${letter}.`);
        } else {
          result.push(`${t.endPartition}.`);
        }
      } else if (el.type === 'while') {
        let conditionText;
        if (el.condition) {
          conditionText = el.conditionValue
            ? `${el.condition} (${el.conditionValue})`
            : el.condition;
        } else {
          conditionText = el.exitCondition || el.conditionValue || '';
        }
        result.push(`${t.repeatWhile} ${conditionText}, ${t.consistingOf}:`);
        const subElements = formatElements(el.elements);
        result.push(...subElements.map(line => `   ${line}`));
        result.push(`${t.endRepeat}.`);
      } else if (el.type === 'repeat') {
        result.push(`${t.repeatDoWhile} ${el.condition}, ${t.consistingOf}:`);
        const subElements = formatElements(el.elements);
        result.push(...subElements.map(line => `   ${line}`));
        result.push(`${t.endRepeat}.`);
      } else if (el.type === 'fork') {
        forkCounter++;
        const forkNumber = forkCounter;
        result.push(`${t.parallelExecution} ${forkNumber}, ${t.consistingOf}:`);
        let branchNumber = 0;
        for (const branch of el.branches) {
          branchNumber++;
          result.push(`   ${t.branch} ${branchNumber}:`);
          const branchElements = formatElements(branch);
          result.push(...branchElements.map(line => `      ${line}`));
        }
        result.push(`${t.endParallelExecution} ${forkNumber}.`);
      }
    }
    return result;
  }

  const flowLines = formatElements(parsed.elements);
  parts.push('<ul>');
  for (const line of flowLines) {
    parts.push(`<li>${line}</li>`);
  }
  parts.push('</ul>');

  return parts.join('\n');
}

module.exports = {
  parsePlantUMLActivityDiagram,
  generateAccessibleDescription,
  i18n
};
