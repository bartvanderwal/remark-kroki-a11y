/**
 * Sequence Diagram Parser (Mermaid)
 *
 * Parses Mermaid sequence diagram syntax and generates structured accessible descriptions.
 *
 * Output format example:
 * "Sequentiediagram met 3 deelnemers: Roodkapje, Wolf en Oma.
 * Interacties:
 * - Roodkapje roept Wolf.groet() aan
 * - Wolf roept Roodkapje.vraagBestemming() aan
 * - Roodkapje antwoordt Wolf: 'Naar Oma'
 * ..."
 */

// Localization strings
const i18n = {
	nl: {
		sequenceDiagram: 'Sequentiediagram',
		withParticipants: 'met {count} deelnemers',
		withParticipant: 'met {count} deelnemer',
		participants: 'Deelnemers',
		interactions: 'Interacties',
		ofType: 'van het type',
		instanceOf: 'instantie van',
		calls: 'roept',
		methodCall: 'aan',
		responds: 'antwoordt',
		and: 'en',
		receives: 'ontvangt',
	},
	en: {
		sequenceDiagram: 'Sequence diagram',
		withParticipants: 'with {count} participants',
		withParticipant: 'with {count} participant',
		participants: 'Participants',
		interactions: 'Interactions',
		ofType: 'of type',
		instanceOf: 'instance of',
		calls: 'calls',
		methodCall: '',
		responds: 'responds to',
		and: 'and',
		receives: 'receives',
	}
};

/**
 * Parse participant line
 * Formats:
 * - participant Alice                              (simple)
 * - participant alice as alice: Person             (Mermaid with type)
 * - participant "klok:\nKlokDisplay" as klok       (PlantUML with display name)
 */
function parseParticipantLine(line) {
	const trimmed = line.trim();

	// Skip if not a participant line
	if (!trimmed.startsWith('participant ') && !trimmed.startsWith('actor ')) {
		return null;
	}

	const isActor = trimmed.startsWith('actor ');
	const rest = isActor ? trimmed.slice(6).trim() : trimmed.slice(12).trim();

	// PlantUML format: participant "name:\nType" as alias
	// e.g., participant "klok:\nKlokDisplay" as klok
	if (rest.startsWith('"')) {
		const closeQuote = rest.indexOf('"', 1);
		if (closeQuote !== -1) {
			let displayName = rest.slice(1, closeQuote);

			const afterQuote = rest.slice(closeQuote + 1).trim();
			const asMatch = afterQuote.match(/^as\s+(\w+)/);
			const alias = asMatch ? asMatch[1] : null;

			// Check for "name:\nType" or "name: Type" pattern
			const typeMatch = displayName.match(/^([^:]+):\\n(.+)$/) ||
			                  displayName.match(/^([^:]+):\s*(.+)$/);
			if (typeMatch) {
				return {
					id: alias || typeMatch[1].trim(),
					alias: typeMatch[1].trim(),
					type: typeMatch[2].trim(),
					isActor: isActor
				};
			}

			// No type annotation, just display name
			displayName = displayName.replace(/\\n/g, ' ').trim();
			return {
				id: alias || displayName,
				alias: displayName,
				type: null,
				isActor: isActor
			};
		}
	}

	// Check for alias with type: participant alice as alice: Person (Mermaid)
	const asIndex = rest.indexOf(' as ');
	if (asIndex !== -1) {
		const id = rest.slice(0, asIndex).trim();
		const aliasAndType = rest.slice(asIndex + 4).trim();

		// Check for type annotation: alice: Person
		const colonIndex = aliasAndType.indexOf(':');
		if (colonIndex !== -1) {
			const alias = aliasAndType.slice(0, colonIndex).trim();
			const type = aliasAndType.slice(colonIndex + 1).trim();
			return {
				id: id,
				alias: alias,
				type: type,
				isActor: isActor
			};
		}

		// Just an alias without type
		return {
			id: id,
			alias: aliasAndType,
			type: null,
			isActor: isActor
		};
	}

	// Simple participant: participant Alice
	return {
		id: rest,
		alias: rest,
		type: null,
		isActor: isActor
	};
}

/**
 * Parse message line
 * Formats:
 * - Alice->>Bob: hello()        (Mermaid)
 * - Alice-->>Bob: "response"    (Mermaid)
 * - Alice -> Bob: hello()       (PlantUML)
 * - [-> Alice: message          (PlantUML: from outside)
 */
function parseMessageLine(line, _participants) {
	const trimmed = line.trim();

	// Skip PlantUML control flow keywords
	if (trimmed.startsWith('opt ') || trimmed.startsWith('alt ') ||
	    trimmed.startsWith('else') || trimmed === 'end' ||
	    trimmed.startsWith('loop ') || trimmed.startsWith('break ') ||
	    trimmed.startsWith('critical ') || trimmed.startsWith('group ')) {
		return null;
	}

	// Handle PlantUML "from outside" syntax: [-> target: message
	if (trimmed.startsWith('[->') || trimmed.startsWith('[-->')) {
		const isResponse = trimmed.startsWith('[-->');
		const afterArrow = trimmed.slice(isResponse ? 4 : 3).trim();
		const colonIndex = afterArrow.indexOf(':');
		if (colonIndex !== -1) {
			const to = afterArrow.slice(0, colonIndex).trim();
			let message = afterArrow.slice(colonIndex + 1).trim();
			const isMethodCall = message.includes('(') && message.includes(')');
			return {
				from: '[extern]',
				to: to,
				message: message,
				type: isResponse ? 'response' : 'call',
				isMethodCall: isMethodCall,
				isExternal: true
			};
		}
		return null;
	}

	// Match arrow patterns: ->>, -->, ->, -->>
	const arrowPatterns = [
		{ pattern: '-->>', type: 'response' },
		{ pattern: '->>', type: 'call' },
		{ pattern: '-->', type: 'response' },
		{ pattern: '->', type: 'call' },
	];

	for (const { pattern, type } of arrowPatterns) {
		const arrowIndex = trimmed.indexOf(pattern);
		if (arrowIndex === -1) continue;

		const from = trimmed.slice(0, arrowIndex).trim();
		const afterArrow = trimmed.slice(arrowIndex + pattern.length).trim();

		// Split on colon to get target and message
		const colonIndex = afterArrow.indexOf(':');
		if (colonIndex === -1) continue;

		const to = afterArrow.slice(0, colonIndex).trim();
		let message = afterArrow.slice(colonIndex + 1).trim();

		// Remove surrounding quotes if present
		if (message.startsWith('"') && message.endsWith('"')) {
			message = message.slice(1, -1);
		}

		// Check if message looks like a method call (ends with parentheses)
		const isMethodCall = message.includes('(') && message.includes(')');

		return {
			from: from,
			to: to,
			message: message,
			type: type,
			isMethodCall: isMethodCall
		};
	}

	return null;
}

/**
 * Parse Mermaid/PlantUML sequence diagram
 */
function parseMermaidSequenceDiagram(code) {
	const lines = code.split('\n');
	const result = {
		participants: [],
		messages: [],
		hasAutonumber: false,
	};

	// Keep track of participant order for implicit participants
	const participantMap = new Map();

	for (const line of lines) {
		const trimmed = line.trim();

		// Skip empty lines, comments, PlantUML markers, and directives
		if (!trimmed || trimmed.startsWith('%%') || trimmed === 'sequenceDiagram' ||
		    trimmed === '@startuml' || trimmed === '@enduml' ||
		    trimmed.startsWith('skinparam') || trimmed.startsWith('hide ') ||
		    trimmed.startsWith('left to right') || trimmed.startsWith('title ')) {
			continue;
		}

		// Check for autonumber directive
		if (trimmed === 'autonumber') {
			result.hasAutonumber = true;
			continue;
		}

		// Try to parse as participant
		const participant = parseParticipantLine(trimmed);
		if (participant) {
			participantMap.set(participant.id, participant);
			result.participants.push(participant);
			continue;
		}

		// Try to parse as message
		const message = parseMessageLine(trimmed, participantMap);
		if (message) {
			// Add implicit participants if not already defined (skip [extern])
			if (!participantMap.has(message.from) && message.from !== '[extern]') {
				const implicit = { id: message.from, alias: message.from, type: null, isActor: false };
				participantMap.set(message.from, implicit);
				result.participants.push(implicit);
			}
			if (!participantMap.has(message.to) && message.to !== '[extern]') {
				const implicit = { id: message.to, alias: message.to, type: null, isActor: false };
				participantMap.set(message.to, implicit);
				result.participants.push(implicit);
			}

			result.messages.push(message);
		}
	}

	return result;
}

/**
 * Format participant name for description
 */
function formatParticipantName(participant, locale) {
	const t = i18n[locale] || i18n.nl;

	if (participant.type) {
		return `${participant.alias} ${t.ofType} ${participant.type}`;
	}
	return participant.alias || participant.id;
}

/**
 * Format participant list for first line
 */
function formatParticipantList(participants, locale) {
	const t = i18n[locale] || i18n.nl;

	if (participants.length === 0) return '';
	if (participants.length === 1) {
		return formatParticipantName(participants[0], locale);
	}

	const names = participants.map(p => formatParticipantName(p, locale));
	const lastTwo = names.slice(-2);
	const rest = names.slice(0, -2);

	if (rest.length > 0) {
		return rest.join(', ') + ', ' + lastTwo.join(` ${t.and} `);
	}
	return lastTwo.join(` ${t.and} `);
}

/**
 * Format a message/interaction for description
 */
function formatMessage(message, participantMap, locale) {
	const t = i18n[locale] || i18n.nl;

	const fromParticipant = participantMap.get(message.from);
	const toParticipant = participantMap.get(message.to);

	const fromName = fromParticipant ? (fromParticipant.alias || fromParticipant.id) : message.from;
	const toName = toParticipant ? (toParticipant.alias || toParticipant.id) : message.to;

	// External call (from outside the system)
	if (message.isExternal) {
		if (message.isMethodCall) {
			return `${toName} ${t.receives} ${message.message}`;
		}
		return `${toName} ${t.receives} ${message.message}()`;
	}

	if (message.type === 'response') {
		// Response: "Alice antwoordt Bob: message" or "Alice antwoordt Bob: 'text message'"
		// Use quotes only for text messages (not for type returns like "Groet" or "void")
		const msg = message.message;
		// Check if it looks like a text message (contains spaces)
		// Single words without spaces are treated as type returns (Groet, void, String, etc.)
		const looksLikeTextMessage = msg.includes(' ');
		if (looksLikeTextMessage) {
			return `${fromName} ${t.responds} ${toName}: '${msg}'`;
		}
		// Type return or simple identifier - no quotes
		return `${fromName} ${t.responds} ${toName}: ${msg}`;
	}

	if (message.isMethodCall) {
		// Method call: "Alice roept Bob.method() aan"
		if (locale === 'nl') {
			return `${fromName} ${t.calls} ${toName}.${message.message} ${t.methodCall}`;
		}
		// English: "Alice calls Bob.method()"
		return `${fromName} ${t.calls} ${toName}.${message.message}`;
	}

	// Simple message (treat as method call without parens)
	if (locale === 'nl') {
		return `${fromName} ${t.calls} ${toName}.${message.message}() ${t.methodCall}`;
	}
	return `${fromName} ${t.calls} ${toName}.${message.message}()`;
}

/**
 * Generate accessible description from parsed sequence diagram
 */
function generateAccessibleDescription(parsed, locale = 'nl') {
	const t = i18n[locale] || i18n.nl;
	const parts = [];

	const participantCount = parsed.participants.length;

	// First line: summary with participant list (wrapped in <p> for proper HTML)
	const countText = participantCount === 1
		? t.withParticipant.replace('{count}', participantCount)
		: t.withParticipants.replace('{count}', participantCount);

	const participantList = formatParticipantList(parsed.participants, locale);
	parts.push(`<p>${t.sequenceDiagram} ${countText}: ${participantList}.</p>`);

	// Build participant map for message formatting
	const participantMap = new Map();
	for (const p of parsed.participants) {
		participantMap.set(p.id, p);
	}

	// Interactions - use HTML lists for proper rendering
	if (parsed.messages.length > 0) {
		parts.push(`<p><strong>${t.interactions}:</strong></p>`);

		if (parsed.hasAutonumber) {
			// Ordered list with explicit numbers for accessibility
			parts.push('<ol>');
			let stepNumber = 1;
			for (const message of parsed.messages) {
				const formattedMessage = formatMessage(message, participantMap, locale);
				parts.push(`<li>${stepNumber}. ${formattedMessage}</li>`);
				stepNumber++;
			}
			parts.push('</ol>');
		} else {
			// Unordered list
			parts.push('<ul>');
			for (const message of parsed.messages) {
				const formattedMessage = formatMessage(message, participantMap, locale);
				parts.push(`<li>${formattedMessage}</li>`);
			}
			parts.push('</ul>');
		}
	}

	return parts.join('\n');
}

module.exports = {
	parseMermaidSequenceDiagram,
	generateAccessibleDescription,
	i18n
};
