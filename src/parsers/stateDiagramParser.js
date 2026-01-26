/**
 * PlantUML State Diagram Parser
 *
 * Parses PlantUML state diagram syntax and generates structured accessible descriptions.
 * Supports ARIA-friendly output for screen readers.
 */

// Localization strings
const i18n = {
	nl: {
		stateDiagram: 'Toestandsdiagram',
		withStates: 'met {count} toestand(en)',
		andTransitions: 'en {count} overgang(en)',
		states: 'Toestanden',
		transitions: 'Overgangen',
		initialState: 'Initiële toestand',
		finalState: 'Eindtoestand',
		state: 'Toestand',
		from: 'van',
		to: 'naar',
		when: 'wanneer',
		selfLoop: 'blijft in dezelfde toestand',
		transitionTo: 'gaat over naar',
	},
	en: {
		stateDiagram: 'State diagram',
		withStates: 'with {count} state(s)',
		andTransitions: 'and {count} transition(s)',
		states: 'States',
		transitions: 'Transitions',
		initialState: 'Initial state',
		finalState: 'Final state',
		state: 'State',
		from: 'from',
		to: 'to',
		when: 'when',
		selfLoop: 'stays in the same state',
		transitionTo: 'transitions to',
	}
};

/**
 * Parse a PlantUML state diagram
 */
function parsePlantUMLStateDiagram(plantUmlCode) {
	const lines = plantUmlCode.split('\n');
	const result = {
		states: new Set(),
		transitions: [],
		initialState: null,
		finalStates: new Set(),
	};

	for (const line of lines) {
		const trimmed = line.trim();

		// Skip empty lines, comments, and PlantUML directives
		if (!trimmed || trimmed.startsWith('@') || trimmed.startsWith('\'') || trimmed.startsWith('hide') || trimmed.startsWith('skinparam')) {
			continue;
		}

		// Parse transitions: State1 --> State2 : label
		// Also handles: [*] --> State (initial) and State --> [*] (final)
		const transitionMatch = trimmed.match(/^(\[?\*?\]?|\w+)\s*(-->|->)\s*(\[?\*?\]?|\w+)\s*(?::\s*(.+))?$/);
		if (transitionMatch) {
			const [, from, , to, label] = transitionMatch;

			// Handle initial state [*] --> Something
			if (from === '[*]') {
				result.initialState = to;
				result.states.add(to);
			}
			// Handle final state Something --> [*]
			else if (to === '[*]') {
				result.finalStates.add(from);
				result.states.add(from);
			}
			// Regular transition
			else {
				result.states.add(from);
				result.states.add(to);
				result.transitions.push({
					from,
					to,
					label: label ? label.trim() : null
				});
			}
			continue;
		}

		// Parse state definitions: state "Label" as StateName
		const stateDefMatch = trimmed.match(/^state\s+"([^"]+)"\s+as\s+(\w+)/);
		if (stateDefMatch) {
			result.states.add(stateDefMatch[2]);
			continue;
		}

		// Parse simple state definitions: state StateName
		const simpleStateMatch = trimmed.match(/^state\s+(\w+)/);
		if (simpleStateMatch) {
			result.states.add(simpleStateMatch[1]);
			continue;
		}
	}

	return {
		states: Array.from(result.states),
		transitions: result.transitions,
		initialState: result.initialState,
		finalStates: Array.from(result.finalStates),
	};
}

/**
 * Generate accessible description from parsed diagram
 */
function generateAccessibleDescription(parsed, locale = 'nl') {
	const t = i18n[locale] || i18n.nl;
	const parts = [];

	const stateCount = parsed.states.length;
	const transitionCount = parsed.transitions.length;

	// Summary
	parts.push(`${t.stateDiagram} ${t.withStates.replace('{count}', stateCount)} ${t.andTransitions.replace('{count}', transitionCount)}.`);

	// Initial state
	if (parsed.initialState) {
		parts.push('');
		parts.push(`${t.initialState}: ${parsed.initialState}`);
	}

	// States section
	if (parsed.states.length > 0) {
		parts.push('');
		parts.push(`${t.states}:`);
		parsed.states.forEach((state, index) => {
			let stateDesc = `${index + 1}. ${state}`;
			if (parsed.finalStates.includes(state)) {
				stateDesc += ` (${t.finalState.toLowerCase()})`;
			}
			parts.push(stateDesc);
		});
	}

	// Transitions section
	if (parsed.transitions.length > 0) {
		parts.push('');
		parts.push(`${t.transitions}:`);
		parsed.transitions.forEach((trans, index) => {
			let transDesc;
			if (trans.from === trans.to) {
				// Self-loop
				transDesc = `${index + 1}. ${trans.from} ${t.selfLoop}`;
			} else {
				transDesc = `${index + 1}. ${trans.from} ${t.transitionTo} ${trans.to}`;
			}
			if (trans.label) {
				transDesc += ` ${t.when} "${trans.label}"`;
			}
			parts.push(transDesc);
		});
	}

	// Final states
	if (parsed.finalStates.length > 0) {
		parts.push('');
		parts.push(`${t.finalState}(s): ${parsed.finalStates.join(', ')}`);
	}

	return parts.join('\n');
}

module.exports = {
	parsePlantUMLStateDiagram,
	generateAccessibleDescription,
	i18n
};
