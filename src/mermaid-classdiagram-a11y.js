/**
 * Mermaid Classdiagram A11Y Reader
 * 
 * Parses Mermaid classdiagram syntax and generates accessible descriptions
 * for screen readers.
 * 
 * Features:
 * - Extracts class definitions, attributes, methods
 * - Identifies relationships (inheritance, implementation, association)
 * - Detects interfaces and abstract classes
 * - Handles method parameters and return types
 * - Generates human-readable descriptions in Dutch
 */

class MermaidClassdiagramA11YReader {
	constructor(options = {}) {
		this.classes = new Map();
		this.relationships = [];
		this.notes = new Map();
		this.locale = options.locale || 'en-US';
		this.translations = this.loadTranslations(this.locale);
	}

	/**
	 * Load translations for the specified locale
	 */
	loadTranslations(locale) {
		const translations = {
			nl: {
				visibility: {
					attribute: {
						public: 'publiek',
						private: 'private',
						protected: 'protected',
						package: 'package',
					},
					method: {
						public: 'publieke',
						private: 'private',
						protected: 'protected',
						package: 'package',
					},
				},
				labels: {
					classDiagram: 'Klassendiagram',
					class: 'Klasse',
					interface: 'Interface',
					classes: 'Klassen',
					relationships: 'Relaties',
					notes: 'Notities',
					attribute: 'attribuut',
					method: 'methode',
					withType: 'van type',
					withoutParameters: 'zonder parameters',
					parameter: 'parameter',
					returnType: 'return type',
					hasAssociation: 'heeft een associatie naar',
					withName: 'met naam',
					multiplicity: 'multipliciteit',
					implements: 'implementeert interface',
					inherits: 'erft over van',
					noteFor: 'Bij klasse',
				},
				aria: {
					goToOverview: 'Ga naar overzicht',
					goToClasses: 'Ga naar klassen',
					goToRelationships: 'Ga naar relaties',
					goToNotes: 'Ga naar notities',
				},
			},
			en: {
				visibility: {
					attribute: {
						public: 'public',
						private: 'private',
						protected: 'protected',
						package: 'package',
					},
					method: {
						public: 'public',
						private: 'private',
						protected: 'protected',
						package: 'package',
					},
				},
				labels: {
					classDiagram: 'Class diagram',
					class: 'Class',
					interface: 'Interface',
					classes: 'Classes',
					relationships: 'Relationships',
					notes: 'Notes',
					attribute: 'attribute',
					method: 'method',
					withType: 'of type',
					withoutParameters: 'without parameters',
					parameter: 'parameter',
					returnType: 'return type',
					hasAssociation: 'has an association to',
					withName: 'with name',
					multiplicity: 'multiplicity',
					implements: 'implements interface',
					inherits: 'inherits from',
					noteFor: 'Note for class',
				},
				aria: {
					goToOverview: 'Go to overview',
					goToClasses: 'Go to classes',
					goToRelationships: 'Go to relationships',
					goToNotes: 'Go to notes',
				},
			},
		};

		return translations[locale] || translations['nl'];
	}

	/**
	 * Parse Mermaid classdiagram syntax
	 * @param {string} diagramSource - The Mermaid classdiagram code
	 * @returns {Object} Parsed diagram structure
	 */
	parse(diagramSource) {
		this.classes.clear();
		this.relationships = [];
		this.notes.clear();

		const lines = diagramSource.split('\n').filter(line => line.trim());

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			// Skip diagram header
			if (line.startsWith('classDiagram')) continue;

			// Parse class definitions
			if (line.startsWith('class ')) {
				this.parseClass(line, lines, i);
			}

			// Parse relationships
			if (this.isRelationshipLine(line)) {
				this.parseRelationship(line);
			}

			// Parse notes
			if (line.startsWith('note ')) {
				this.parseNote(line);
			}
		}

		return {
			classes: Array.from(this.classes.values()),
			relationships: this.relationships,
			notes: Array.from(this.notes.entries()),
		};
	}

	/**
	 * Parse a class definition block
	 */
	parseClass(line, lines, startIndex) {
		const classMatch = line.match(/class\s+(\w+)\s*\{/);
		if (!classMatch) return;

		const className = classMatch[1];
		const classInfo = {
			name: className,
			type: 'class', // will be updated if it's an interface
			attributes: [],
			methods: [],
		};

		let i = startIndex + 1;
		while (i < lines.length) {
			const contentLine = lines[i].trim();

			if (contentLine === '}') break;

			// Check for interface marker
			if (contentLine.includes('<<interface>>')) {
				classInfo.type = 'interface';
			}

			// Parse attributes and methods
			const memberMatch = contentLine.match(/^([+\-#~])(\w+)\s*:\s*(.+)$/);
			const methodMatch = contentLine.match(/^([+\-#~])(\w+)\((.*?)\)\s*(.+)$/);
			if (methodMatch) {
				const [, visibility, methodName, paramsStr, returnType] = methodMatch;
				const params = this.parseParameters(paramsStr);
				classInfo.methods.push({
					visibility: this.getVisibility(visibility),
					name: methodName,
					parameters: params,
					returnType: returnType.trim(),
				});
			} else if (memberMatch) {
				const [, visibility, attrName, attrType] = memberMatch;
				classInfo.attributes.push({
					visibility: this.getVisibility(visibility),
					name: attrName,
					type: attrType.trim(),
				});
			}

			i++;
		}

		this.classes.set(className, classInfo);
	}

	/**
	 * Parse method parameters
	 */
	parseParameters(paramsStr) {
		if (!paramsStr.trim()) return [];

		return paramsStr.split(',').map(param => {
			const parts = param.trim().split(':');
			return {
				name: parts[0].trim(),
				type: parts[1]?.trim() || '',
			};
		});
	}

	/**
	 * Get visibility symbol mapping
	 */
	getVisibility(symbol) {
		const map = {
			'+': 'public',
			'-': 'private',
			'#': 'protected',
			'~': 'package',
		};
		return map[symbol] || 'public';
	}

	/**
	 * Translate visibility to localized text for attributes
	 */
	translateVisibilityForAttribute(visibility) {
		return this.translations.visibility.attribute[visibility] || visibility;
	}

	/**
	 * Translate visibility to localized text for methods
	 */
	translateVisibilityForMethod(visibility) {
		return this.translations.visibility.method[visibility] || visibility;
	}

	/**
	 * Check if line is a relationship
	 */
	isRelationshipLine(line) {
		// Association: -->
		// Implementation: ..|>
		// Inheritance: --|>
		return line.includes('-->') || line.includes('..|>') || line.includes('--|>');
	}

	/**
	 * Parse relationship line
	 */
	parseRelationship(line) {
		// Implementation: ClassName1 ..|> ClassName2
		if (line.includes('..|>')) {
			const parts = line.split('..|>');
			if (parts.length === 2) {
				this.relationships.push({
					from: parts[0].trim(),
					to: parts[1].trim(),
					type: 'implementation',
				});
			}
			return;
		}

		// Inheritance: ClassName1 --|> ClassName2
		if (line.includes('--|>')) {
			const parts = line.split('--|>');
			if (parts.length === 2) {
				this.relationships.push({
					from: parts[0].trim(),
					to: parts[1].trim(),
					type: 'inheritance',
				});
			}
			return;
		}

		// Association: ClassName1 --> "cardinality" ClassName2 : relationshipName
		if (line.includes('-->')) {
			const parts = line.split('-->');
			if (parts.length === 2) {
				const from = parts[0].trim();
				const rightPart = parts[1].trim();
				
				// Extract cardinality (between quotes)
				let cardinality = '';
				let remaining = rightPart;
				const quoteStart = rightPart.indexOf('"');
				if (quoteStart !== -1) {
					const quoteEnd = rightPart.indexOf('"', quoteStart + 1);
					if (quoteEnd !== -1) {
						cardinality = rightPart.substring(quoteStart + 1, quoteEnd);
						remaining = rightPart.substring(quoteEnd + 1).trim();
					}
				}
				
				// Extract class name and relationship name (after colon)
				let to = remaining;
				let name = '';
				const colonIndex = remaining.indexOf(':');
				if (colonIndex !== -1) {
					to = remaining.substring(0, colonIndex).trim();
					name = remaining.substring(colonIndex + 1).trim();
				}
				
				this.relationships.push({
					from: from,
					to: to,
					type: 'association',
					cardinality: cardinality,
					name: name,
				});
			}
			return;
		}
	}

	/**
	 * Parse note
	 */
	parseNote(line) {
		const noteMatch = line.match(/note\s+for\s+(\w+)\s+"(.+?)"/);
		if (noteMatch) {
			this.notes.set(noteMatch[1], noteMatch[2]);
		}
	}

	/**
	 * Generate accessible description
	 * @param {string} diagramSource - The Mermaid classdiagram code
	 * @returns {string} Human-readable description for screen readers
	 */
	generateDescription(diagramSource) {
		const parsed = this.parse(diagramSource);
		const { classes, relationships, notes } = parsed;
		const t = this.translations.labels;

		const description = [];

		// Overview
		const relationshipsText = relationships.length === 0 
			? 'geen relaties'
			: `${relationships.length} ${relationships.length !== 1 ? 'relaties' : 'relatie'}`;
		description.push(
			`${t.classDiagram} met ${classes.length} ${classes.length !== 1 ? 'klasses' : 'klasse'} en ${relationshipsText}.`
		);

		// Classes section
		if (classes.length > 0) {
			description.push(`${t.classes}:`);
			classes.forEach(cls => {
				description.push(this.describeClass(cls));
			});
		}

		// Relationships section
		if (relationships.length > 0) {
			description.push(`${t.relationships}:`);
			relationships.forEach(rel => {
				description.push(this.describeRelationship(rel));
			});
		}

		// Notes section
		if (notes.length > 0) {
			description.push(`${t.notes}:`);
			notes.forEach(([className, noteText]) => {
				description.push(`${t.noteFor} ${className}: "${noteText}"`);
			});
		}

		return description.join('\n');
	}

	/**
	 * Describe a class
	 */
	describeClass(cls) {
		const t = this.translations.labels;
		const typeLabel = cls.type === 'interface' ? t.interface : t.class;
		let desc = `${typeLabel} ${cls.name}`;

		const details = [];

		// Attributes
		cls.attributes.forEach(attr => {
			const visibilityNL = this.translateVisibilityForAttribute(attr.visibility);
			details.push(
				`${visibilityNL} ${t.attribute} ${attr.name} ${t.withType} ${attr.type}`
			);
		});

		// Methods
		cls.methods.forEach(method => {
			const visibilityNL = this.translateVisibilityForMethod(method.visibility);
			const params = method.parameters.length === 0
				? t.withoutParameters
				: method.parameters
					.map(p => `${t.parameter} ${p.name}${p.type ? ` ${t.withType} ${p.type}` : ''}`)
					.join(', ');

			details.push(
				`${visibilityNL} ${t.method} ${method.name}, ${params}, ${t.returnType} ${method.returnType}`
			);
		});

		if (details.length > 0) {
			desc += ' met:\n' + details.map(d => d).join('\n');
		}

		return desc;
	}

	/**
	 * Describe a relationship
	 */
	describeRelationship(rel) {
		const t = this.translations.labels;
		const typeDescriptions = {
			'association': `${rel.from} ${t.hasAssociation} ${rel.to}, ${t.withName} ${rel.name}, ${t.multiplicity} ${rel.cardinality}`,
			'implementation': `${rel.from} ${t.implements} ${rel.to}`,
			'inheritance': `${rel.from} ${t.inherits} ${rel.to}`,
		};

		return typeDescriptions[rel.type] || '';
	}

	/**
	 * Generate ARIA navigation structure hints
	 */
	generateAriaStructure(diagramSource) {
		const parsed = this.parse(diagramSource);
		const { classes, relationships, notes } = parsed;
		const t = this.translations.aria;

		return {
			sections: [
				{
					id: 'overview',
					label: t.goToOverview,
					content: `${classes.length} ${classes.length !== 1 ? 'klasses' : 'klasse'}, ${relationships.length === 0 ? 'geen relaties' : `${relationships.length} ${relationships.length !== 1 ? 'relaties' : 'relatie'}`}`,
				},
				{
					id: 'classes',
					label: t.goToClasses,
					count: classes.length,
				},
				{
					id: 'relationships',
					label: t.goToRelationships,
					count: relationships.length,
				},
				{
					id: 'notes',
					label: t.goToNotes,
					count: notes.length,
				},
			],
		};
	}
}

module.exports = MermaidClassdiagramA11YReader;
