/**
 * Activity Diagram Parser (PlantUML)
 *
 * Parses PlantUML activity diagram syntax and generates structured accessible descriptions.
 *
 * Output format example:
 * "Activiteitendiagram met 2 activiteiten en 1 beslispunt.
 * Stroom:
 * Stap 1. Start
 * Stap 2. Beslissing: Graphviz installed?
 *    - Ja: process all diagrams
 *    - Nee: process only sequence and activity diagrams
 * Stap 3. Stop"
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
		flow: 'Stroom',
		step: 'Stap',
		start: 'Start',
		stop: 'Stop',
		end: 'Einde',
		decision: 'Beslissing',
		yes: 'Ja',
		no: 'Nee',
		partition: 'Partitie',
		repeatWhile: 'Herhaal zolang',
		parallelExecution: 'Parallelle uitvoering',
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
		repeatWhile: 'Repeat while',
		parallelExecution: 'Parallel execution',
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
	let insideFork = false;
	let forkBranches = [];
	let currentForkBranch = [];
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

		// Start node
		if (trimmed === 'start') {
			const element = { type: 'start' };
			if (currentPartition) {
				partitionElements.push(element);
			} else if (insideFork) {
				currentForkBranch.push(element);
			} else if (insideWhile) {
				whileElements.push(element);
			} else if (insideIf) {
				ifBranches[currentBranch].push(element);
			} else {
				elements.push(element);
			}
			continue;
		}

		// Stop/end node
		if (trimmed === 'stop' || trimmed === 'end') {
			const element = { type: trimmed };
			if (currentPartition) {
				partitionElements.push(element);
			} else if (insideFork) {
				currentForkBranch.push(element);
			} else if (insideWhile) {
				whileElements.push(element);
			} else if (insideIf) {
				ifBranches[currentBranch].push(element);
			} else {
				elements.push(element);
			}
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
			const element = {
				type: 'decision',
				condition: ifCondition,
				yesBranch: ifBranches.yes,
				noBranch: ifBranches.no
			};
			if (currentPartition) {
				partitionElements.push(element);
			} else {
				elements.push(element);
			}
			insideIf = false;
			ifCondition = null;
			ifBranches = { yes: [], no: [] };
			currentBranch = null;
			continue;
		}

		// While loop: while (condition?) is (yes)
		const whileMatch = trimmed.match(/^while\s*\(([^)]+)\)\s*is\s*\(([^)]+)\)$/);
		if (whileMatch) {
			insideWhile = true;
			whileCondition = whileMatch[1];
			whileConditionValue = whileMatch[2];
			whileElements = [];
			continue;
		}

		// End while: endwhile (no)
		const endWhileMatch = trimmed.match(/^endwhile\s*\(([^)]+)\)$/);
		if (endWhileMatch && insideWhile) {
			const element = {
				type: 'while',
				condition: whileCondition,
				conditionValue: whileConditionValue,
				elements: whileElements
			};
			if (currentPartition) {
				partitionElements.push(element);
			} else {
				elements.push(element);
			}
			insideWhile = false;
			whileCondition = null;
			whileConditionValue = null;
			whileElements = [];
			continue;
		}

		// Fork (parallel): fork
		if (trimmed === 'fork') {
			insideFork = true;
			forkBranches = [];
			currentForkBranch = [];
			continue;
		}

		// Fork again: fork again
		if (trimmed === 'fork again' && insideFork) {
			forkBranches.push(currentForkBranch);
			currentForkBranch = [];
			continue;
		}

		// End fork: end fork
		if (trimmed === 'end fork' && insideFork) {
			forkBranches.push(currentForkBranch);
			const element = {
				type: 'fork',
				branches: forkBranches
			};
			if (currentPartition) {
				partitionElements.push(element);
			} else {
				elements.push(element);
			}
			insideFork = false;
			forkBranches = [];
			currentForkBranch = [];
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
				// Clean up the activity text
				let activityText = multiLineActivity
					.replace(/\\n/g, ' ')
					.replace(/__([^_]+)__/g, '$1')  // Remove PlantUML underline formatting
					.trim();

				const element = { type: 'activity', text: activityText };

				if (currentPartition) {
					partitionElements.push(element);
				} else if (insideFork) {
					currentForkBranch.push(element);
				} else if (insideWhile) {
					whileElements.push(element);
				} else if (insideIf) {
					ifBranches[currentBranch].push(element);
				} else {
					elements.push(element);
				}
				multiLineActivity = null;
			} else {
				multiLineActivity += ' ' + trimmed;
			}
			continue;
		}

		// Activity: :text; (single line)
		const activityMatch = trimmed.match(/^:([^;]+);$/);
		if (activityMatch) {
			// Clean up the activity text
			let activityText = activityMatch[1]
				.replace(/\\n/g, ' ')
				.replace(/__([^_]+)__/g, '$1')  // Remove PlantUML underline formatting
				.trim();

			const element = { type: 'activity', text: activityText };

			if (currentPartition) {
				partitionElements.push(element);
			} else if (insideFork) {
				currentForkBranch.push(element);
			} else if (insideWhile) {
				whileElements.push(element);
			} else if (insideIf) {
				ifBranches[currentBranch].push(element);
			} else {
				elements.push(element);
			}
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
 * Generate accessible description from parsed activity diagram
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
		// Use simple count without "with" prefix when partitions are present
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

	let stepNumber = 0;

	/**
	 * Format elements for output
	 * @param {Array} elements - Elements to format
	 * @param {string} prefix - Prefix for sub-numbering (e.g., "1" for "1.1", "1.2")
	 * @param {string} partitionLetter - Letter for partition sub-steps (e.g., "A" for "A1", "A2")
	 * @returns {Array} Formatted lines
	 */
	function formatElements(elements, prefix = '', partitionLetter = '') {
		const result = [];
		let subStepNumber = 0;

		for (const el of elements) {
			// Start and stop are not numbered as steps
			if (el.type === 'start') {
				result.push(t.start);
				continue;
			} else if (el.type === 'stop') {
				result.push(t.stop);
				continue;
			} else if (el.type === 'end') {
				result.push(t.end);
				continue;
			}

			// For partition sub-steps, use letter+number (A1, A2, etc.)
			// For other nested elements (while, fork), use prefix.number (1.1, 1.2, etc.)
			let stepLabel;
			if (partitionLetter) {
				subStepNumber++;
				stepLabel = `${partitionLetter}${subStepNumber}`;
			} else if (prefix) {
				subStepNumber++;
				stepLabel = `${prefix}.${subStepNumber}`;
			} else {
				stepNumber++;
				stepLabel = `${stepNumber}`;
			}

			if (el.type === 'activity') {
				result.push(`${t.step} ${stepLabel}. ${el.text}`);
			} else if (el.type === 'decision') {
				result.push(`${t.step} ${stepLabel}. ${t.decision}: ${el.condition}`);
				// Format branches as sub-items
				if (el.yesBranch.length > 0) {
					const yesText = el.yesBranch
						.filter(e => e.type === 'activity')
						.map(e => e.text)
						.join(', ') || '';
					if (yesText) {
						result.push(`   - ${t.yes}: ${yesText}`);
					}
				}
				if (el.noBranch.length > 0) {
					const noText = el.noBranch
						.filter(e => e.type === 'activity')
						.map(e => e.text)
						.join(', ') || '';
					if (noText) {
						result.push(`   - ${t.no}: ${noText}`);
					}
				}
			} else if (el.type === 'partition') {
				// Partitions are not numbered as steps, use letter + title format
				const letter = extractPartitionLetter(el.name);
				const title = extractPartitionTitle(el.name);
				result.push(`${t.partition} ${letter}: ${title}`);
				// Sub-steps use the partition letter (A1, A2, etc.)
				const subElements = formatElements(el.elements, '', letter);
				result.push(...subElements.map(line => `   ${line}`));
			} else if (el.type === 'while') {
				const conditionText = el.conditionValue
					? `${el.condition} (${el.conditionValue})`
					: el.condition;
				result.push(`${t.step} ${stepLabel}. ${t.repeatWhile} ${conditionText}:`);
				const subElements = formatElements(el.elements, stepLabel, '');
				result.push(...subElements.map(line => `   ${line}`));
			} else if (el.type === 'fork') {
				result.push(`${t.step} ${stepLabel}. ${t.parallelExecution}:`);
				let forkSubNumber = 0;
				for (const branch of el.branches) {
					for (const branchEl of branch) {
						if (branchEl.type === 'activity') {
							forkSubNumber++;
							result.push(`   ${t.step} ${stepLabel}.${forkSubNumber}. ${branchEl.text}`);
						}
					}
				}
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
