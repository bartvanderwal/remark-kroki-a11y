/**
 * Class Diagram Parser (Mermaid & PlantUML)
 *
 * Parses class diagram syntax and generates structured accessible descriptions.
 * Supports both Mermaid and PlantUML syntax.
 *
 * Output format example:
 * "Klassendiagram met 5 klassen en 4 relaties.
 * Klassen:
 * - Klasse Woordenlijst met:
 *   - Private attribuut woorden van type String Array
 *   - Publieke methode sorteer, zonder parameters, return type void
 * Relaties:
 * - Woordenlijst heeft een associatie naar SorteerStrategie..."
 */

// Localization strings
const i18n = {
	nl: {
		classDiagram: 'Klassendiagram',
		withClasses: 'met {count} klasse(n)',
		andRelations: 'en {count} relatie(s)',
		classes: 'Klassen',
		class: 'Klasse',
		interface: 'Interface',
		abstractClass: 'Abstracte klasse',
		enumeration: 'Enumeratie',
		with: 'met',
		relations: 'Relaties',
		notes: 'Notities',
		noteFor: 'Bij klasse {class}',
		// Visibility
		public: 'publieke',
		private: 'private',
		protected: 'beschermde',
		packagePrivate: 'package-private',
		// Members
		attribute: 'attribuut',
		method: 'methode',
		ofType: 'van type',
		returnType: 'return type',
		withParameters: 'met parameter(s)',
		withoutParameters: 'zonder parameters',
		parameter: 'parameter',
		// Relation types (format: "A heeft een associatie-relatie met naam 'x' met B")
		inheritance: 'erft over van',
		implementation: 'implementeert interface',
		association: 'heeft een associatie-relatie',
		aggregation: 'heeft een aggregatie-relatie',
		composition: 'heeft een compositie-relatie',
		dependency: 'heeft een afhankelijkheid naar',
		dependencyFrom: 'heeft een afhankelijkheid vanaf',
		withNamedRelation: "met naam '{name}' met",
		withUnnamedRelation: 'met',
		multiplicity: 'multipliciteit',
		multiplicityTo: 'naar',
		withStereotype: 'met stereotype',
		// Empty members
		noAttributes: 'geen attributen',
		noMethods: 'geen methoden',
		noMethodsAndAttributes: 'zonder methoden en attributen',
		// Array types
		array: 'Array',
	},
	en: {
		classDiagram: 'Class diagram',
		withClasses: 'with {count} class(es)',
		andRelations: 'and {count} relation(s)',
		classes: 'Classes',
		class: 'Class',
		interface: 'Interface',
		abstractClass: 'Abstract class',
		enumeration: 'Enumeration',
		with: 'with',
		relations: 'Relations',
		notes: 'Notes',
		noteFor: 'Note for class {class}',
		// Visibility
		public: 'public',
		private: 'private',
		protected: 'protected',
		packagePrivate: 'package-private',
		// Members
		attribute: 'attribute',
		method: 'method',
		ofType: 'of type',
		returnType: 'return type',
		withParameters: 'with parameter(s)',
		withoutParameters: 'without parameters',
		parameter: 'parameter',
		// Relation types (format: "A has an association-relationship named 'x' with B")
		inheritance: 'extends',
		implementation: 'implements interface',
		association: 'has an association-relationship',
		aggregation: 'has an aggregation-relationship',
		composition: 'has a composition-relationship',
		dependency: 'has a dependency to',
		dependencyFrom: 'has a dependency from',
		withNamedRelation: "named '{name}' with",
		withUnnamedRelation: 'with',
		multiplicity: 'multiplicity',
		multiplicityTo: 'to',
		withStereotype: 'with stereotype',
		// Empty members
		noAttributes: 'no attributes',
		noMethods: 'no methods',
		noMethodsAndAttributes: 'without methods and attributes',
		// Array types
		array: 'Array',
	}
};

/**
 * Parse visibility symbol to readable text
 */
function parseVisibility(symbol, locale) {
	const t = i18n[locale] || i18n.nl;
	const visibilityMap = {
		'+': t.public,
		'-': t.private,
		'#': t.protected,
		'~': t.packagePrivate,
	};
	return visibilityMap[symbol] || t.public;
}

/**
 * Parse a type string, handling arrays
 */
function parseType(typeStr, locale) {
	const t = i18n[locale] || i18n.nl;
	if (!typeStr) return null;

	// Handle array notations: String[], List<String>, etc.
	if (typeStr.endsWith('[]')) {
		return typeStr.slice(0, -2) + ' ' + t.array;
	}
	if (typeStr.indexOf('<') !== -1 && typeStr.indexOf('>') !== -1) {
		// Generic type like List<String>
		return typeStr;
	}
	return typeStr;
}

/**
 * Parse parameters string into structured array
 */
function parseParameters(paramsStr) {
	if (!paramsStr || paramsStr.trim() === '') return [];

	const params = [];
	const paramParts = paramsStr.split(',');

	for (const part of paramParts) {
		const trimmed = part.trim();
		if (!trimmed) continue;

		// Format: name : Type or name Type
		const colonIdx = trimmed.indexOf(':');
		if (colonIdx !== -1) {
			params.push({
				name: trimmed.slice(0, colonIdx).trim(),
				type: trimmed.slice(colonIdx + 1).trim() || 'unknown',
			});
		} else {
			// Try space separation
			const spaceIdx = trimmed.indexOf(' ');
			if (spaceIdx !== -1) {
				params.push({
					name: trimmed.slice(0, spaceIdx).trim(),
					type: trimmed.slice(spaceIdx + 1).trim() || 'unknown',
				});
			} else {
				params.push({
					name: trimmed,
					type: 'unknown',
				});
			}
		}
	}

	return params;
}

/**
 * Remove quotes from start and end of string
 */
function removeQuotes(str) {
	if (!str) return str;
	let result = str.trim();
	if (result.startsWith('"') && result.endsWith('"')) {
		result = result.slice(1, -1);
	}
	return result;
}

/**
 * Arrow definitions for relation parsing (ordered from specific to generic)
 * Each arrow has: pattern, type, reverse flag
 */
const ARROWS = [
	// Inheritance arrows
	{ pattern: '--|>', type: 'inheritance', reverse: false },
	{ pattern: '<|--', type: 'inheritance', reverse: true },
	// Implementation arrows
	{ pattern: '..|>', type: 'implementation', reverse: false },
	{ pattern: '<|..', type: 'implementation', reverse: true },
	// Composition arrows (diamond is at the "whole" side)
	// A --* B means A has composition to B (A contains B)
	// A *-- B means A has composition to B (diamond at A)
	{ pattern: '--*', type: 'composition', reverse: true },
	{ pattern: '*--', type: 'composition', reverse: false },
	// Aggregation arrows (diamond is at the "whole" side)
	// A --o B means A has aggregation to B (A contains B)
	// A o-- B means A has aggregation to B (diamond at A)
	{ pattern: '--o', type: 'aggregation', reverse: true },
	{ pattern: 'o--', type: 'aggregation', reverse: false },
	// Dependency arrows
	{ pattern: '..>', type: 'dependency', reverse: false },
	{ pattern: '<..', type: 'dependency', reverse: true },
	// Association arrows
	{ pattern: '-->', type: 'association', reverse: false },
	{ pattern: '<--', type: 'association', reverse: true },
	// Simple lines (must be last, they are substrings of others)
	{ pattern: '--', type: 'association', reverse: false },
	{ pattern: '..', type: 'dependency', reverse: false },
];

/**
 * Check if string looks like a multiplicity (e.g., "1", "0..*", "*", "1..n")
 */
function looksLikeMultiplicity(str) {
	if (!str) return false;
	const s = str.trim();
	// Multiplicities contain digits, dots, asterisks, or 'n'
	for (let i = 0; i < s.length; i++) {
		const c = s.charAt(i);
		if (c !== '0' && c !== '1' && c !== '2' && c !== '3' && c !== '4' &&
		    c !== '5' && c !== '6' && c !== '7' && c !== '8' && c !== '9' &&
		    c !== '.' && c !== '*' && c !== 'n') {
			return false;
		}
	}
	return s.length > 0;
}

/**
 * Split multiplicity string on \n separator
 * Returns: { multiplicity: string|null, name: string|null }
 */
function splitMultiplicityAndName(multStr) {
	if (!multStr) return { multiplicity: null, name: null };

	const newlineIdx = multStr.indexOf('\\n');
	if (newlineIdx === -1) {
		// No separator - determine if it's a multiplicity or name
		if (looksLikeMultiplicity(multStr)) {
			return { multiplicity: multStr.trim(), name: null };
		} else {
			return { multiplicity: null, name: multStr.trim() };
		}
	}

	// Has newline separator - split and categorize each part
	const part1 = multStr.slice(0, newlineIdx).trim();
	const part2 = multStr.slice(newlineIdx + 2).trim();

	if (looksLikeMultiplicity(part1)) {
		return { multiplicity: part1, name: part2 || null };
	} else if (looksLikeMultiplicity(part2)) {
		return { multiplicity: part2, name: part1 || null };
	} else {
		// Neither looks like multiplicity - treat both as names, no multiplicity
		return { multiplicity: null, name: part1 || part2 };
	}
}

/**
 * Parse a relation line using string functions (no regex)
 * Returns true if a relation was found and added
 */
function parseRelationLine(line, result) {
	const trimmed = line.trim();
	if (!trimmed) return false;

	// First, check for multiplicities pattern: A "1" -- "4" B or A "1" -l- "4" B
	// This is: ClassName "mult" separator "mult" ClassName
	const firstQuoteIdx = trimmed.indexOf('"');
	if (firstQuoteIdx !== -1) {
		const secondQuoteIdx = trimmed.indexOf('"', firstQuoteIdx + 1);
		if (secondQuoteIdx !== -1) {
			const thirdQuoteIdx = trimmed.indexOf('"', secondQuoteIdx + 1);
			if (thirdQuoteIdx !== -1) {
				const fourthQuoteIdx = trimmed.indexOf('"', thirdQuoteIdx + 1);
				if (fourthQuoteIdx !== -1) {
					// We have 4 quotes: A "mult1" separator "mult2" B
					const from = trimmed.slice(0, firstQuoteIdx).trim();
					const mult1Raw = trimmed.slice(firstQuoteIdx + 1, secondQuoteIdx);
					const mult2Raw = trimmed.slice(thirdQuoteIdx + 1, fourthQuoteIdx);
					const rest = trimmed.slice(fourthQuoteIdx + 1).trim();

					// Parse multiplicities - they may contain embedded relation names
					const parsed1 = splitMultiplicityAndName(mult1Raw);
					const parsed2 = splitMultiplicityAndName(mult2Raw);

					// Rest might contain the target class and optionally a label after :
					let to = rest;
					let label = null;
					const colonIdx = rest.indexOf(':');
					if (colonIdx !== -1) {
						to = rest.slice(0, colonIdx).trim();
						label = rest.slice(colonIdx + 1).trim();
					}

					// Prefer label from colon, then from mult2 (target side), then from mult1 (source side)
					if (!label) {
						label = parsed2.name || parsed1.name;
					}

					// Ensure classes exist in result
					if (from && !result.classes[from]) {
						result.classes[from] = { name: from, stereotype: null, attributes: [], methods: [] };
					}
					if (to && !result.classes[to]) {
						result.classes[to] = { name: to, stereotype: null, attributes: [], methods: [] };
					}

					result.relations.push({
						from: from,
						to: to,
						type: 'association',
						label: label,
						multiplicityFrom: parsed1.multiplicity,
						multiplicityTo: parsed2.multiplicity,
						reverse: false
					});
					return true;
				}
			}
		}
	}

	// Try each arrow pattern in order
	for (const arrow of ARROWS) {
		const idx = trimmed.indexOf(arrow.pattern);
		if (idx === -1) continue;

		// Make sure we don't match partial arrows (e.g., '--' in '--|>')
		// Check that this is really this arrow and not part of a longer one
		let isPartOfLongerArrow = false;
		for (const otherArrow of ARROWS) {
			if (otherArrow.pattern.length > arrow.pattern.length &&
				otherArrow.pattern.indexOf(arrow.pattern) !== -1) {
				// Check if this longer arrow is present at this position
				const otherIdx = trimmed.indexOf(otherArrow.pattern);
				if (otherIdx !== -1 && otherIdx <= idx &&
					otherIdx + otherArrow.pattern.length > idx) {
					isPartOfLongerArrow = true;
					break;
				}
			}
		}
		if (isPartOfLongerArrow) continue;

		// Split the line on the arrow
		const leftPart = trimmed.slice(0, idx).trim();
		const rightPart = trimmed.slice(idx + arrow.pattern.length).trim();

		// Extract label if present (after colon)
		let rightClass = rightPart;
		let label = null;
		const colonIdx = rightPart.indexOf(':');
		if (colonIdx !== -1) {
			rightClass = rightPart.slice(0, colonIdx).trim();
			label = rightPart.slice(colonIdx + 1).trim();
		}

		// Handle multiplicities in single-sided format: A --> "1" B
		let multiplicity = null;
		if (rightClass.startsWith('"')) {
			const endQuoteIdx = rightClass.indexOf('"', 1);
			if (endQuoteIdx !== -1) {
				multiplicity = rightClass.slice(1, endQuoteIdx);
				rightClass = rightClass.slice(endQuoteIdx + 1).trim();
			}
		}

		// Determine from and to based on reverse flag
		let from = arrow.reverse ? rightClass : leftPart;
		let to = arrow.reverse ? leftPart : rightClass;

		// Remove any quotes from class names
		from = removeQuotes(from);
		to = removeQuotes(to);

		// Skip if we don't have valid class names
		if (!from || !to) continue;

		// Ensure classes exist in result
		if (!result.classes[from]) {
			result.classes[from] = { name: from, stereotype: null, attributes: [], methods: [] };
		}
		if (!result.classes[to]) {
			result.classes[to] = { name: to, stereotype: null, attributes: [], methods: [] };
		}

		result.relations.push({
			from: from,
			to: to,
			type: arrow.type,
			label: label,
			multiplicity: multiplicity,
			multiplicityFrom: null,
			multiplicityTo: multiplicity,
			reverse: arrow.reverse
		});
		return true;
	}

	return false;
}

/**
 * Parse class line (class ClassName or class ClassName <<stereotype>>)
 * Returns class info or null
 */
function parseClassLine(line) {
	const trimmed = line.trim();

	// Must start with 'class '
	if (!trimmed.startsWith('class ')) return null;

	let rest = trimmed.slice(6).trim(); // Remove 'class '

	// Check for opening brace
	const hasBrace = rest.endsWith('{');
	if (hasBrace) {
		rest = rest.slice(0, -1).trim();
	}

	// Check for stereotype <<...>>
	let stereotype = null;
	const stereotypeStart = rest.indexOf('<<');
	const stereotypeEnd = rest.indexOf('>>');
	if (stereotypeStart !== -1 && stereotypeEnd !== -1 && stereotypeEnd > stereotypeStart) {
		stereotype = rest.slice(stereotypeStart + 2, stereotypeEnd).trim();
		rest = rest.slice(0, stereotypeStart).trim();
	}

	// What remains should be the class name
	const className = rest.trim();
	if (!className) return null;

	// Validate class name (only word characters)
	for (let i = 0; i < className.length; i++) {
		const c = className.charCodeAt(i);
		const isValid = (c >= 65 && c <= 90) ||  // A-Z
		                (c >= 97 && c <= 122) || // a-z
		                (c >= 48 && c <= 57) ||  // 0-9
		                c === 95;                 // _
		if (!isValid) return null;
	}

	return {
		name: className,
		stereotype: stereotype,
		hasBrace: hasBrace
	};
}

/**
 * Parse interface line (interface InterfaceName)
 */
function parseInterfaceLine(line) {
	const trimmed = line.trim();

	if (!trimmed.startsWith('interface ')) return null;

	let rest = trimmed.slice(10).trim(); // Remove 'interface '

	const hasBrace = rest.endsWith('{');
	if (hasBrace) {
		rest = rest.slice(0, -1).trim();
	}

	const interfaceName = rest.trim();
	if (!interfaceName) return null;

	return {
		name: interfaceName,
		stereotype: 'interface',
		hasBrace: hasBrace
	};
}

/**
 * Parse abstract class line (abstract class ClassName)
 */
function parseAbstractClassLine(line) {
	const trimmed = line.trim();

	if (!trimmed.startsWith('abstract class ')) return null;

	let rest = trimmed.slice(15).trim(); // Remove 'abstract class '

	const hasBrace = rest.endsWith('{');
	if (hasBrace) {
		rest = rest.slice(0, -1).trim();
	}

	const className = rest.trim();
	if (!className) return null;

	return {
		name: className,
		stereotype: 'abstract',
		hasBrace: hasBrace
	};
}

/**
 * Parse member line (attribute or method)
 */
function parseMemberLine(line) {
	const trimmed = line.trim();
	if (!trimmed) return null;

	// Check for visibility prefix
	let visibility = '+'; // default public
	let rest = trimmed;

	const firstChar = trimmed.charAt(0);
	if (firstChar === '+' || firstChar === '-' || firstChar === '#' || firstChar === '~') {
		visibility = firstChar;
		rest = trimmed.slice(1).trim();
	}

	// Check if it's a method (contains parentheses)
	const parenOpen = rest.indexOf('(');
	const parenClose = rest.indexOf(')');

	if (parenOpen !== -1 && parenClose !== -1 && parenClose > parenOpen) {
		// It's a method
		const methodName = rest.slice(0, parenOpen).trim();
		const paramsStr = rest.slice(parenOpen + 1, parenClose);
		let returnType = 'void';

		// Check for return type after )
		const afterParen = rest.slice(parenClose + 1).trim();
		if (afterParen) {
			// Could be ': Type' or just 'Type'
			if (afterParen.startsWith(':')) {
				returnType = afterParen.slice(1).trim() || 'void';
			} else {
				returnType = afterParen || 'void';
			}
		}

		return {
			type: 'method',
			visibility: visibility,
			name: methodName,
			parameters: parseParameters(paramsStr),
			returnType: returnType
		};
	}

	// It's an attribute
	const colonIdx = rest.indexOf(':');
	if (colonIdx !== -1) {
		const attrName = rest.slice(0, colonIdx).trim();
		const attrType = rest.slice(colonIdx + 1).trim();
		return {
			type: 'attribute',
			visibility: visibility,
			name: attrName,
			attrType: attrType || 'unknown'
		};
	}

	// No colon, might be "name Type" or just "name" (Larman-style without type)
	const spaceIdx = rest.indexOf(' ');
	if (spaceIdx !== -1) {
		return {
			type: 'attribute',
			visibility: visibility,
			name: rest.slice(0, spaceIdx).trim(),
			attrType: rest.slice(spaceIdx + 1).trim() || null
		};
	}

	// Just a name without type (Larman-style analysis phase attribute)
	if (rest) {
		return {
			type: 'attribute',
			visibility: visibility,
			name: rest,
			attrType: null
		};
	}

	return null;
}

/**
 * Parse Mermaid class diagram syntax
 */
function parseMermaidClassDiagram(code) {
	const lines = code.split('\n');
	const result = {
		classes: {},
		relations: [],
		notes: [],
	};

	let currentClass = null;
	let inClassBlock = false;

	for (const line of lines) {
		const trimmed = line.trim();

		// Skip empty lines, comments, and directives
		if (!trimmed || trimmed.startsWith('%%') || trimmed.startsWith('classDiagram') || trimmed.startsWith('direction')) {
			continue;
		}

		// Skip style directives
		if (trimmed.startsWith('style ')) {
			continue;
		}

		// End of class block
		if (trimmed === '}') {
			inClassBlock = false;
			currentClass = null;
			continue;
		}

		// Try to parse as class definition
		const classInfo = parseClassLine(trimmed);
		if (classInfo) {
			currentClass = classInfo.name;
			inClassBlock = classInfo.hasBrace;
			if (!result.classes[currentClass]) {
				result.classes[currentClass] = {
					name: currentClass,
					stereotype: classInfo.stereotype,
					attributes: [],
					methods: [],
				};
			} else if (classInfo.stereotype) {
				result.classes[currentClass].stereotype = classInfo.stereotype;
			}
			continue;
		}

		// Stereotype inside class block: <<interface>>, etc.
		if (inClassBlock && currentClass && trimmed.startsWith('<<') && trimmed.endsWith('>>')) {
			const stereotype = trimmed.slice(2, -2).toLowerCase();
			result.classes[currentClass].stereotype = stereotype;
			continue;
		}

		// Member inside class block (attribute or method)
		if (inClassBlock && currentClass) {
			const member = parseMemberLine(trimmed);
			if (member) {
				if (member.type === 'method') {
					result.classes[currentClass].methods.push({
						visibility: member.visibility,
						name: member.name,
						parameters: member.parameters,
						returnType: member.returnType,
					});
				} else if (member.type === 'attribute') {
					result.classes[currentClass].attributes.push({
						visibility: member.visibility,
						name: member.name,
						type: member.attrType,
					});
				}
				continue;
			}
		}

		// Note: note for ClassName "text"
		if (trimmed.startsWith('note for ')) {
			const rest = trimmed.slice(9); // Remove 'note for '
			const spaceIdx = rest.indexOf(' ');
			if (spaceIdx !== -1) {
				const className = rest.slice(0, spaceIdx).trim();
				let noteText = rest.slice(spaceIdx + 1).trim();
				// Remove surrounding quotes if present
				if (noteText.startsWith('"') && noteText.endsWith('"')) {
					noteText = noteText.slice(1, -1);
				}
				result.notes.push({
					className: className,
					text: noteText,
				});
				continue;
			}
		}

		// Try to parse as relation
		parseRelationLine(trimmed, result);
	}

	return result;
}

/**
 * Parse PlantUML class diagram syntax
 */
function parsePlantUMLClassDiagram(code) {
	const lines = code.split('\n');
	const result = {
		classes: {},
		relations: [],
		notes: [],
	};

	let currentClass = null;
	let inClassBlock = false;

	for (const line of lines) {
		const trimmed = line.trim();

		// Skip empty lines, comments, and directives
		if (!trimmed || trimmed.startsWith('@') || trimmed.startsWith('\'') ||
			trimmed.startsWith('hide') || trimmed.startsWith('skinparam') ||
			trimmed.startsWith('rectangle') || trimmed.startsWith('title ') ||
			trimmed.startsWith('!theme')) {
			continue;
		}

		// End of class block
		if (trimmed === '}') {
			inClassBlock = false;
			currentClass = null;
			continue;
		}

		// Interface definition
		const interfaceInfo = parseInterfaceLine(trimmed);
		if (interfaceInfo) {
			currentClass = interfaceInfo.name;
			inClassBlock = interfaceInfo.hasBrace;
			result.classes[currentClass] = {
				name: currentClass,
				stereotype: 'interface',
				attributes: [],
				methods: [],
			};
			continue;
		}

		// Abstract class definition
		const abstractInfo = parseAbstractClassLine(trimmed);
		if (abstractInfo) {
			currentClass = abstractInfo.name;
			inClassBlock = abstractInfo.hasBrace;
			result.classes[currentClass] = {
				name: currentClass,
				stereotype: 'abstract',
				attributes: [],
				methods: [],
			};
			continue;
		}

		// Regular class definition
		const classInfo = parseClassLine(trimmed);
		if (classInfo) {
			currentClass = classInfo.name;
			inClassBlock = classInfo.hasBrace;
			if (!result.classes[currentClass]) {
				result.classes[currentClass] = {
					name: currentClass,
					stereotype: classInfo.stereotype,
					attributes: [],
					methods: [],
				};
			} else if (classInfo.stereotype) {
				result.classes[currentClass].stereotype = classInfo.stereotype;
			}
			continue;
		}

		// Member inside class block
		if (inClassBlock && currentClass) {
			const member = parseMemberLine(trimmed);
			if (member) {
				if (member.type === 'method') {
					result.classes[currentClass].methods.push({
						visibility: member.visibility,
						name: member.name,
						parameters: member.parameters,
						returnType: member.returnType,
					});
				} else if (member.type === 'attribute') {
					result.classes[currentClass].attributes.push({
						visibility: member.visibility,
						name: member.name,
						type: member.attrType,
					});
				}
				continue;
			}
		}

		// Note: note right of ClassName : text
		if (trimmed.startsWith('note ')) {
			const rest = trimmed.slice(5);
			// Check for 'right of', 'left of', 'top of', 'bottom of'
			const ofIdx = rest.indexOf(' of ');
			if (ofIdx !== -1) {
				const afterOf = rest.slice(ofIdx + 4);
				const colonIdx = afterOf.indexOf(':');
				if (colonIdx !== -1) {
					const className = afterOf.slice(0, colonIdx).trim();
					const noteText = afterOf.slice(colonIdx + 1).trim();
					result.notes.push({
						className: className,
						text: noteText,
					});
					continue;
				}
			}
		}

		// Try to parse as relation
		parseRelationLine(trimmed, result);
	}

	return result;
}

/**
 * Generate accessible description from parsed class diagram
 * Returns HTML with proper <ul><li> structure for better screen reader navigation
 */
function generateAccessibleDescription(parsed, locale = 'nl') {
	const t = i18n[locale] || i18n.nl;
	const parts = [];

	const classCount = Object.keys(parsed.classes).length;
	const relationCount = parsed.relations.length;

	// Summary
	parts.push('<p>' + t.classDiagram + ' ' + t.withClasses.replace('{count}', classCount) + ' ' + t.andRelations.replace('{count}', relationCount) + '.</p>');

	// Classes section
	if (classCount > 0) {
		parts.push('<p><strong>' + t.classes + ':</strong></p>');
		parts.push('<ul>');

		for (const className of Object.keys(parsed.classes)) {
			const classData = parsed.classes[className];

			// Class header with stereotype
			let classHeader;
			const stereotypeLower = classData.stereotype ? classData.stereotype.toLowerCase() : null;
			if (stereotypeLower === 'interface') {
				classHeader = t.interface + ' ' + className;
			} else if (stereotypeLower === 'abstract') {
				classHeader = t.abstractClass + ' ' + className;
			} else if (stereotypeLower === 'enumeration') {
				classHeader = t.enumeration + ' ' + className;
			} else if (classData.stereotype) {
				// Custom stereotype (e.g., Aggregate Root, Entity, Value Object)
				classHeader = t.class + ' ' + className + ' ' + t.withStereotype + ' ' + classData.stereotype;
			} else {
				classHeader = t.class + ' ' + className;
			}

			const hasAttributes = classData.attributes.length > 0;
			const hasMethods = classData.methods.length > 0;
			const hasMembers = hasAttributes || hasMethods;

			parts.push('<li><strong>' + classHeader + '</strong>');

			// Check if class has no members at all
			if (!hasMembers) {
				parts.push(' ' + t.noMethodsAndAttributes);
			} else {
				parts.push(' ' + t.with + ':');
				parts.push('<ul>');

				// Methods
				for (const method of classData.methods) {
					const visibility = parseVisibility(method.visibility, locale);
					let methodDesc = visibility + ' ' + t.method + ' \'' + method.name + '\'';

					if (method.parameters.length === 0) {
						methodDesc += ', ' + t.withoutParameters;
					} else {
						const paramDescs = method.parameters.map(function(p) {
							// Only include type if present and not 'unknown'
							if (p.type && p.type !== 'unknown') {
								return '\'' + p.name + '\' ' + t.ofType + ' ' + p.type;
							} else {
								return '\'' + p.name + '\'';
							}
						});
						methodDesc += ', ' + t.withParameters + ' ' + paramDescs.join(', ');
					}

					methodDesc += ', ' + t.returnType + ' ' + method.returnType;
					parts.push('<li>' + methodDesc + '</li>');
				}

				// Attributes
				for (const attr of classData.attributes) {
					const visibility = parseVisibility(attr.visibility, locale);
					const type = parseType(attr.type, locale);
					// Only include type if present (Fowler-style), omit for Larman-style
					if (type) {
						parts.push('<li>' + visibility + ' ' + t.attribute + ' \'' + attr.name + '\' ' + t.ofType + ' ' + type + '</li>');
					} else {
						parts.push('<li>' + visibility + ' ' + t.attribute + ' \'' + attr.name + '\'' + '</li>');
					}
				}

				// Explicit messages for missing members when class has some members
				if (!hasAttributes && hasMethods) {
					parts.push('<li>' + t.noAttributes + '</li>');
				}
				if (!hasMethods && hasAttributes) {
					parts.push('<li>' + t.noMethods + '</li>');
				}

				parts.push('</ul>');
			}

			parts.push('</li>');
		}

		parts.push('</ul>');
	}

	// Relations section
	if (relationCount > 0) {
		parts.push('<p><strong>' + t.relations + ':</strong></p>');
		parts.push('<ul>');

		for (const rel of parsed.relations) {
			let relDesc;

			// Helper to build relation with optional name
			// Format: "A heeft een associatie-relatie met naam 'x' met B" or "A heeft een associatie-relatie met B"
			function buildRelationDesc(from, relationType, to, label) {
				if (label) {
					const namedPart = t.withNamedRelation.replace('{name}', label);
					return from + ' ' + relationType + ' ' + namedPart + ' ' + to;
				} else {
					return from + ' ' + relationType + ' ' + t.withUnnamedRelation + ' ' + to;
				}
			}

			switch (rel.type) {
			case 'inheritance':
				// Inheritance doesn't use the named pattern
				relDesc = rel.from + ' ' + t.inheritance + ' ' + rel.to;
				break;
			case 'implementation':
				// Implementation doesn't use the named pattern
				relDesc = rel.from + ' ' + t.implementation + ' ' + rel.to;
				break;
			case 'association':
				relDesc = buildRelationDesc(rel.from, t.association, rel.to, rel.label);
				break;
			case 'aggregation':
				relDesc = buildRelationDesc(rel.from, t.aggregation, rel.to, rel.label);
				break;
			case 'composition':
				relDesc = buildRelationDesc(rel.from, t.composition, rel.to, rel.label);
				break;
			case 'dependency':
				if (rel.reverse) {
					relDesc = rel.from + ' ' + t.dependencyFrom + ' ' + rel.to;
				} else {
					relDesc = rel.from + ' ' + t.dependency + ' ' + rel.to;
				}
				break;
			default:
				relDesc = rel.from + ' -> ' + rel.to;
			}

			// Add multiplicity if present (label is now part of the main description)
			const details = [];
			// Handle multiplicities
			if (rel.multiplicityFrom && rel.multiplicityTo) {
				details.push(t.multiplicity + ' ' + rel.multiplicityFrom + ' ' + t.multiplicityTo + ' ' + rel.multiplicityTo);
			} else if (rel.multiplicityTo) {
				details.push(t.multiplicity + ' ' + rel.multiplicityTo);
			} else if (rel.multiplicity) {
				details.push(t.multiplicity + ' ' + rel.multiplicity);
			}

			if (details.length > 0) {
				relDesc += ', ' + details.join(', ');
			}

			parts.push('<li>' + relDesc + '</li>');
		}

		parts.push('</ul>');
	}

	// Notes section
	if (parsed.notes.length > 0) {
		parts.push('<p><strong>' + t.notes + ':</strong></p>');
		parts.push('<ul>');

		for (const note of parsed.notes) {
			const noteHeader = t.noteFor.replace('{class}', note.className);
			// Clean up escaped newlines in note text
			const cleanText = note.text.split('\\n').join(' ');
			parts.push('<li>' + noteHeader + ': "' + cleanText + '"</li>');
		}

		parts.push('</ul>');
	}

	return parts.join('\n');
}

/**
 * Detect if code is Mermaid or PlantUML
 */
function detectDiagramFormat(code) {
	const lowerCode = code.toLowerCase();
	if (lowerCode.indexOf('@startuml') !== -1 || lowerCode.indexOf('@enduml') !== -1) {
		return 'plantuml';
	}
	if (lowerCode.indexOf('classdiagram') !== -1) {
		return 'mermaid';
	}
	// Default to Mermaid if unclear
	return 'mermaid';
}

/**
 * Parse class diagram (auto-detect format)
 */
function parseClassDiagram(code) {
	const format = detectDiagramFormat(code);
	if (format === 'plantuml') {
		return parsePlantUMLClassDiagram(code);
	}
	return parseMermaidClassDiagram(code);
}

module.exports = {
	parseMermaidClassDiagram,
	parsePlantUMLClassDiagram,
	parseClassDiagram,
	generateAccessibleDescription,
	detectDiagramFormat,
	i18n
};
