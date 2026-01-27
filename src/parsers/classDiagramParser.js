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
		// Relation types
		inheritance: 'erft van',
		implementation: 'implementeert interface',
		association: 'heeft een associatie naar',
		aggregation: 'heeft een aggregatie naar',
		composition: 'heeft een compositie naar',
		dependency: 'heeft een afhankelijkheid naar',
		withName: 'met naam',
		multiplicity: 'multipliciteit',
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
		noteFor: 'For class {class}',
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
		// Relation types
		inheritance: 'extends',
		implementation: 'implements interface',
		association: 'has an association to',
		aggregation: 'has an aggregation to',
		composition: 'has a composition to',
		dependency: 'has a dependency to',
		withName: 'named',
		multiplicity: 'multiplicity',
		// Array types
		array: 'Array',
	}
};

/**
 * Parse visibility symbol to readable text
 */
function parseVisibility(symbol, locale) {
	const t = i18n[locale] || i18n.nl;
	switch (symbol) {
		case '+': return t.public;
		case '-': return t.private;
		case '#': return t.protected;
		case '~': return t.packagePrivate;
		default: return t.public;
	}
}

/**
 * Parse a type string, handling arrays
 */
function parseType(typeStr, locale) {
	const t = i18n[locale] || i18n.nl;
	if (!typeStr) return null;

	// Handle array notations: String[], List<String>, etc.
	if (typeStr.endsWith('[]')) {
		return `${typeStr.slice(0, -2)} ${t.array}`;
	}
	if (typeStr.includes('<') && typeStr.includes('>')) {
		// Generic type like List<String>
		return typeStr;
	}
	return typeStr;
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

		// Class definition with block: class ClassName {
		const classBlockMatch = trimmed.match(/^class\s+(\w+)\s*\{?\s*$/);
		if (classBlockMatch) {
			currentClass = classBlockMatch[1];
			inClassBlock = trimmed.includes('{');
			if (!result.classes[currentClass]) {
				result.classes[currentClass] = {
					name: currentClass,
					stereotype: null,
					attributes: [],
					methods: [],
				};
			}
			continue;
		}

		// Stereotype: <<interface>>, <<abstract>>, <<enumeration>>
		if (inClassBlock && currentClass) {
			const stereotypeMatch = trimmed.match(/^<<(\w+)>>$/);
			if (stereotypeMatch) {
				result.classes[currentClass].stereotype = stereotypeMatch[1].toLowerCase();
				continue;
			}
		}

		// Member inside class block (attribute or method)
		if (inClassBlock && currentClass) {
			// Method: +methodName(params) returnType or +methodName(params) : returnType
			const methodMatch = trimmed.match(/^([+\-#~])?(\w+)\s*\(([^)]*)\)\s*:?\s*(\w+)?$/);
			if (methodMatch) {
				const [, visibility, name, params, returnType] = methodMatch;
				result.classes[currentClass].methods.push({
					visibility: visibility || '+',
					name,
					parameters: parseParameters(params),
					returnType: returnType || 'void',
				});
				continue;
			}

			// Attribute: +attributeName : Type or -attributeName Type
			const attrMatch = trimmed.match(/^([+\-#~])?(\w+)\s*:?\s*(.+)?$/);
			if (attrMatch && !trimmed.includes('(')) {
				const [, visibility, name, type] = attrMatch;
				result.classes[currentClass].attributes.push({
					visibility: visibility || '-',
					name,
					type: type ? type.trim() : 'unknown',
				});
				continue;
			}
		}

		// Note: note for ClassName "text"
		const noteMatch = trimmed.match(/^note\s+for\s+(\w+)\s+"([^"]+)"$/);
		if (noteMatch) {
			result.notes.push({
				className: noteMatch[1],
				text: noteMatch[2],
			});
			continue;
		}

		// Relations parsing
		parseRelation(trimmed, result);
	}

	return result;
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
		const paramMatch = trimmed.match(/^(\w+)\s*:?\s*(.+)?$/);
		if (paramMatch) {
			params.push({
				name: paramMatch[1],
				type: paramMatch[2] ? paramMatch[2].trim() : 'unknown',
			});
		}
	}

	return params;
}

/**
 * Parse relation line
 */
function parseRelation(line, result) {
	// Mermaid relation patterns:
	// A --|> B : inheritance
	// A ..|> B : implementation (realization)
	// A --> B : association
	// A --o B : aggregation
	// A --* B : composition
	// A ..> B : dependency
	// With labels: A --> "1" B : label or A "1" --> "*" B : label

	const relationPatterns = [
		// Implementation: A ..|> B
		{ regex: /^(\w+)\s*\.\.\|>\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'implementation' },
		// Inheritance: A --|> B
		{ regex: /^(\w+)\s*--\|>\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'inheritance' },
		// Inheritance (reverse): B <|-- A
		{ regex: /^(\w+)\s*<\|--\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'inheritance', reverse: true },
		// Implementation (reverse): B <|.. A
		{ regex: /^(\w+)\s*<\|\.\.\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'implementation', reverse: true },
		// Composition: A --* B or A *-- B
		{ regex: /^(\w+)\s*--\*\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'composition' },
		{ regex: /^(\w+)\s*\*--\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'composition', reverse: true },
		// Aggregation: A --o B or A o-- B
		{ regex: /^(\w+)\s*--o\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'aggregation' },
		{ regex: /^(\w+)\s*o--\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'aggregation', reverse: true },
		// Dependency: A ..> B
		{ regex: /^(\w+)\s*\.\.>\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'dependency' },
		// Association with multiplicity: A --> "1" B : label
		{ regex: /^(\w+)\s*-->\s*"([^"]+)"\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'association', hasMultiplicity: true },
		// Simple association: A --> B : label
		{ regex: /^(\w+)\s*-->\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'association' },
		// Bidirectional association
		{ regex: /^(\w+)\s*--\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'association' },
		// Dotted line (plain)
		{ regex: /^(\w+)\s*\.\.\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'dependency' },
	];

	for (const pattern of relationPatterns) {
		const match = line.match(pattern.regex);
		if (match) {
			let from, to, label, multiplicity;

			if (pattern.hasMultiplicity) {
				from = match[1];
				multiplicity = match[2];
				to = match[3];
				label = match[4];
			} else if (pattern.reverse) {
				from = match[2];
				to = match[1];
				label = match[3];
			} else {
				from = match[1];
				to = match[2];
				label = match[3];
			}

			result.relations.push({
				from,
				to,
				type: pattern.type,
				label: label ? label.trim() : null,
				multiplicity: multiplicity || null,
			});
			return true;
		}
	}

	return false;
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
			trimmed.startsWith('hide') || trimmed.startsWith('skinparam')) {
			continue;
		}

		// End of class block
		if (trimmed === '}') {
			inClassBlock = false;
			currentClass = null;
			continue;
		}

		// Interface definition: interface InterfaceName
		const interfaceMatch = trimmed.match(/^interface\s+(\w+)\s*\{?\s*$/);
		if (interfaceMatch) {
			currentClass = interfaceMatch[1];
			inClassBlock = trimmed.includes('{');
			result.classes[currentClass] = {
				name: currentClass,
				stereotype: 'interface',
				attributes: [],
				methods: [],
			};
			continue;
		}

		// Abstract class: abstract class ClassName
		const abstractMatch = trimmed.match(/^abstract\s+class\s+(\w+)\s*\{?\s*$/);
		if (abstractMatch) {
			currentClass = abstractMatch[1];
			inClassBlock = trimmed.includes('{');
			result.classes[currentClass] = {
				name: currentClass,
				stereotype: 'abstract',
				attributes: [],
				methods: [],
			};
			continue;
		}

		// Regular class: class ClassName
		const classMatch = trimmed.match(/^class\s+(\w+)\s*\{?\s*$/);
		if (classMatch) {
			currentClass = classMatch[1];
			inClassBlock = trimmed.includes('{');
			if (!result.classes[currentClass]) {
				result.classes[currentClass] = {
					name: currentClass,
					stereotype: null,
					attributes: [],
					methods: [],
				};
			}
			continue;
		}

		// Member inside class block
		if (inClassBlock && currentClass) {
			// Method: +methodName(params) : returnType
			const methodMatch = trimmed.match(/^([+\-#~])?(\w+)\s*\(([^)]*)\)\s*(?::\s*)?(\w+)?$/);
			if (methodMatch) {
				const [, visibility, name, params, returnType] = methodMatch;
				result.classes[currentClass].methods.push({
					visibility: visibility || '+',
					name,
					parameters: parseParameters(params),
					returnType: returnType || 'void',
				});
				continue;
			}

			// Attribute: +attributeName : Type
			const attrMatch = trimmed.match(/^([+\-#~])?(\w+)\s*:\s*(.+)$/);
			if (attrMatch) {
				result.classes[currentClass].attributes.push({
					visibility: attrMatch[1] || '-',
					name: attrMatch[2],
					type: attrMatch[3].trim(),
				});
				continue;
			}
		}

		// Note: note "text" as N1 or note right of ClassName : text
		const noteMatch = trimmed.match(/^note\s+(?:right|left|top|bottom)\s+of\s+(\w+)\s*:\s*(.+)$/);
		if (noteMatch) {
			result.notes.push({
				className: noteMatch[1],
				text: noteMatch[2],
			});
			continue;
		}

		// PlantUML relations
		parsePlantUMLRelation(trimmed, result);
	}

	return result;
}

/**
 * Parse PlantUML relation
 */
function parsePlantUMLRelation(line, result) {
	// PlantUML relation patterns:
	// A --|> B : inheritance
	// A ..|> B : implementation
	// A --> B : association
	// A --o B : aggregation
	// A --* B : composition
	// A ..> B : dependency

	const patterns = [
		{ regex: /^(\w+)\s*\.\.\|>\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'implementation' },
		{ regex: /^(\w+)\s*--\|>\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'inheritance' },
		{ regex: /^(\w+)\s*<\|--\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'inheritance', reverse: true },
		{ regex: /^(\w+)\s*<\|\.\.\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'implementation', reverse: true },
		{ regex: /^(\w+)\s*--\*\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'composition' },
		{ regex: /^(\w+)\s*\*--\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'composition', reverse: true },
		{ regex: /^(\w+)\s*--o\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'aggregation' },
		{ regex: /^(\w+)\s*o--\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'aggregation', reverse: true },
		{ regex: /^(\w+)\s*\.\.>\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'dependency' },
		{ regex: /^(\w+)\s*-->\s*"([^"]+)"\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'association', hasMultiplicity: true },
		{ regex: /^(\w+)\s*-->\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'association' },
		{ regex: /^(\w+)\s*--\s*(\w+)(?:\s*:\s*(.+))?$/, type: 'association' },
	];

	for (const pattern of patterns) {
		const match = line.match(pattern.regex);
		if (match) {
			let from, to, label, multiplicity;

			if (pattern.hasMultiplicity) {
				from = match[1];
				multiplicity = match[2];
				to = match[3];
				label = match[4];
			} else if (pattern.reverse) {
				from = match[2];
				to = match[1];
				label = match[3];
			} else {
				from = match[1];
				to = match[2];
				label = match[3];
			}

			result.relations.push({
				from,
				to,
				type: pattern.type,
				label: label ? label.trim() : null,
				multiplicity: multiplicity || null,
			});
			return true;
		}
	}

	return false;
}

/**
 * Generate accessible description from parsed class diagram
 */
function generateAccessibleDescription(parsed, locale = 'nl') {
	const t = i18n[locale] || i18n.nl;
	const parts = [];

	const classCount = Object.keys(parsed.classes).length;
	const relationCount = parsed.relations.length;

	// Summary
	parts.push(`${t.classDiagram} ${t.withClasses.replace('{count}', classCount)} ${t.andRelations.replace('{count}', relationCount)}.`);

	// Classes section
	if (classCount > 0) {
		parts.push('');
		parts.push(`${t.classes}:`);

		for (const [className, classData] of Object.entries(parsed.classes)) {
			// Class header with stereotype
			let classHeader;
			if (classData.stereotype === 'interface') {
				classHeader = `${t.interface} ${className}`;
			} else if (classData.stereotype === 'abstract') {
				classHeader = `${t.abstractClass} ${className}`;
			} else if (classData.stereotype === 'enumeration') {
				classHeader = `${t.enumeration} ${className}`;
			} else {
				classHeader = `${t.class} ${className}`;
			}

			const hasMembers = classData.attributes.length > 0 || classData.methods.length > 0;
			if (hasMembers) {
				classHeader += ` ${t.with}:`;
			}
			parts.push(classHeader);

			// Attributes
			for (const attr of classData.attributes) {
				const visibility = parseVisibility(attr.visibility, locale);
				const type = parseType(attr.type, locale);
				parts.push(`  - ${visibility} ${t.attribute} ${attr.name} ${t.ofType} ${type}`);
			}

			// Methods
			for (const method of classData.methods) {
				const visibility = parseVisibility(method.visibility, locale);
				let methodDesc = `  - ${visibility} ${t.method} ${method.name}`;

				if (method.parameters.length === 0) {
					methodDesc += `, ${t.withoutParameters}`;
				} else {
					const paramDescs = method.parameters.map(p => `${p.name} ${t.ofType} ${p.type}`);
					methodDesc += `, ${t.withParameters} ${paramDescs.join(', ')}`;
				}

				methodDesc += `, ${t.returnType} ${method.returnType}`;
				parts.push(methodDesc);
			}
		}
	}

	// Relations section
	if (relationCount > 0) {
		parts.push('');
		parts.push(`${t.relations}:`);

		for (const rel of parsed.relations) {
			let relDesc;

			switch (rel.type) {
				case 'inheritance':
					relDesc = `- ${rel.from} ${t.inheritance} ${rel.to}`;
					break;
				case 'implementation':
					relDesc = `- ${rel.from} ${t.implementation} ${rel.to}`;
					break;
				case 'association':
					relDesc = `- ${rel.from} ${t.association} ${rel.to}`;
					break;
				case 'aggregation':
					relDesc = `- ${rel.from} ${t.aggregation} ${rel.to}`;
					break;
				case 'composition':
					relDesc = `- ${rel.from} ${t.composition} ${rel.to}`;
					break;
				case 'dependency':
					relDesc = `- ${rel.from} ${t.dependency} ${rel.to}`;
					break;
				default:
					relDesc = `- ${rel.from} -> ${rel.to}`;
			}

			if (rel.label) {
				relDesc += `, ${t.withName} ${rel.label}`;
			}
			if (rel.multiplicity) {
				relDesc += `, ${t.multiplicity} ${rel.multiplicity}`;
			}

			parts.push(relDesc);
		}
	}

	// Notes section
	if (parsed.notes.length > 0) {
		parts.push('');
		parts.push(`${t.notes}:`);

		for (const note of parsed.notes) {
			const noteHeader = t.noteFor.replace('{class}', note.className);
			// Clean up escaped newlines in note text
			const cleanText = note.text.replace(/\\n/g, ' ');
			parts.push(`- ${noteHeader}: "${cleanText}"`);
		}
	}

	return parts.join('\n');
}

/**
 * Detect if code is Mermaid or PlantUML
 */
function detectDiagramFormat(code) {
	const lowerCode = code.toLowerCase();
	if (lowerCode.includes('@startuml') || lowerCode.includes('@enduml')) {
		return 'plantuml';
	}
	if (lowerCode.includes('classdiagram') || lowerCode.startsWith('classDiagram')) {
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
