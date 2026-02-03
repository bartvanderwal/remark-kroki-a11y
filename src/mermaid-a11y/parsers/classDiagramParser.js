/**
 * Mermaid classDiagram Parser
 *
 * Parses Mermaid classDiagram syntax and generates structured accessible descriptions.
 * Supports ARIA-friendly output for screen readers.
 */

// Localization strings
const i18n = {
	nl: {
		classDiagram: 'Klassendiagram',
		withClasses: 'met {count} klasse(n)',
		andRelations: 'en {count} relatie(s)',
		classes: 'Klassen',
		relations: 'Relaties',
		notes: 'Notities',
		class: 'Klasse',
		interface: 'Interface',
		abstract: 'Abstracte klasse',
		enumeration: 'Enumeratie',
		with: 'met',
		privateAttribute: 'privaat attribuut',
		publicAttribute: 'publiek attribuut',
		protectedAttribute: 'beschermd attribuut',
		packageAttribute: 'package attribuut',
		privateMethod: 'private methode',
		publicMethod: 'publieke methode',
		protectedMethod: 'beschermde methode',
		packageMethod: 'package methode',
		ofType: 'van type',
		withParameter: 'met parameter',
		withParameters: 'met parameters',
		returnType: 'return type',
		noParameters: 'zonder parameters',
		// Relations
		association: 'heeft een associatie naar',
		dependency: 'is afhankelijk van',
		aggregation: 'heeft een aggregatie met',
		composition: 'heeft een compositie met',
		inheritance: 'erft van',
		implementation: 'implementeert interface',
		withName: 'met naam',
		multiplicity: 'multipliciteit',
		noteFor: 'Notitie bij klasse',
	},
	en: {
		classDiagram: 'Class diagram',
		withClasses: 'with {count} class(es)',
		andRelations: 'and {count} relation(s)',
		classes: 'Classes',
		relations: 'Relations',
		notes: 'Notes',
		class: 'Class',
		interface: 'Interface',
		abstract: 'Abstract class',
		enumeration: 'Enumeration',
		with: 'with',
		privateAttribute: 'private attribute',
		publicAttribute: 'public attribute',
		protectedAttribute: 'protected attribute',
		packageAttribute: 'package attribute',
		privateMethod: 'private method',
		publicMethod: 'public method',
		protectedMethod: 'protected method',
		packageMethod: 'package method',
		ofType: 'of type',
		withParameter: 'with parameter',
		withParameters: 'with parameters',
		returnType: 'return type',
		noParameters: 'without parameters',
		// Relations
		association: 'has an association to',
		dependency: 'depends on',
		aggregation: 'has an aggregation with',
		composition: 'has a composition with',
		inheritance: 'extends',
		implementation: 'implements interface',
		withName: 'named',
		multiplicity: 'multiplicity',
		noteFor: 'Note for class',
	}
};

/**
 * Parse visibility modifier
 */
function parseVisibility(char) {
	switch (char) {
		case '+': return 'public';
		case '-': return 'private';
		case '#': return 'protected';
		case '~': return 'package';
		default: return 'package'; // default in UML
	}
}

/**
 * Parse a class member line (attribute or method)
 */
function parseMember(line) {
	const trimmed = line.trim();
	if (!trimmed) return null;

	// Check for visibility prefix
	const visibilityChar = ['+', '-', '#', '~'].includes(trimmed[0]) ? trimmed[0] : null;
	const visibility = parseVisibility(visibilityChar);
	const content = visibilityChar ? trimmed.slice(1).trim() : trimmed;

	// Check if it's a method (contains parentheses)
	const methodMatch = content.match(/^(\w+)\s*\(([^)]*)\)\s*:?\s*(.*)$/);
	if (methodMatch) {
		const [, name, params, returnType] = methodMatch;
		const parameters = params ? parseParameters(params) : [];
		return {
			type: 'method',
			visibility,
			name,
			parameters,
			returnType: returnType.trim() || 'void'
		};
	}

	// It's an attribute
	const attrMatch = content.match(/^(\w+)\s*:\s*(.+)$/);
	if (attrMatch) {
		const [, name, attrType] = attrMatch;
		return {
			type: 'attribute',
			visibility,
			name,
			dataType: attrType.trim()
		};
	}

	// Fallback: just a name
	return {
		type: 'attribute',
		visibility,
		name: content,
		dataType: 'unknown'
	};
}

/**
 * Parse method parameters
 */
function parseParameters(paramsStr) {
	if (!paramsStr.trim()) return [];

	return paramsStr.split(',').map(param => {
		const parts = param.trim().split(/\s*:\s*/);
		if (parts.length === 2) {
			return { name: parts[0].trim(), type: parts[1].trim() };
		}
		return { name: parts[0].trim(), type: 'unknown' };
	});
}

/**
 * Parse relation type from Mermaid syntax
 */
function parseRelationType(arrow) {
	// Mermaid relation arrows
	if (arrow.includes('..|>')) return 'implementation';
	if (arrow.includes('--|>') || arrow.includes('<|--')) return 'inheritance';
	if (arrow.includes('--*') || arrow.includes('*--')) return 'composition';
	if (arrow.includes('--o') || arrow.includes('o--')) return 'aggregation';
	if (arrow.includes('..>') || arrow.includes('<..')) return 'dependency';
	if (arrow.includes('-->') || arrow.includes('<--')) return 'association';
	if (arrow.includes('--')) return 'association';
	return 'association';
}

/**
 * Parse a complete Mermaid classDiagram
 */
function parseClassDiagram(mermaidCode) {
	const lines = mermaidCode.split('\n');
	const result = {
		classes: [],
		relations: [],
		notes: []
	};

	let currentClass = null;
	let inClassBlock = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Skip empty lines and the diagram declaration
		if (!line || line === 'classDiagram') continue;

		// Check for class definition start
		const classStartMatch = line.match(/^class\s+(\w+)\s*\{?\s*$/);
		if (classStartMatch) {
			if (currentClass) {
				result.classes.push(currentClass);
			}
			currentClass = {
				name: classStartMatch[1],
				stereotype: 'class',
				attributes: [],
				methods: []
			};
			inClassBlock = line.includes('{');
			continue;
		}

		// Check for class with stereotype on same line
		const classWithStereotype = line.match(/^class\s+(\w+)\s*\{/);
		if (classWithStereotype && !classStartMatch) {
			if (currentClass) {
				result.classes.push(currentClass);
			}
			currentClass = {
				name: classWithStereotype[1],
				stereotype: 'class',
				attributes: [],
				methods: []
			};
			inClassBlock = true;
			continue;
		}

		// Check for stereotype
		const stereotypeMatch = line.match(/^<<(\w+)>>$/);
		if (stereotypeMatch && currentClass) {
			const stereotype = stereotypeMatch[1].toLowerCase();
			if (stereotype === 'interface') currentClass.stereotype = 'interface';
			else if (stereotype === 'abstract') currentClass.stereotype = 'abstract';
			else if (stereotype === 'enumeration' || stereotype === 'enum') currentClass.stereotype = 'enumeration';
			continue;
		}

		// Check for end of class block
		if (line === '}') {
			if (currentClass) {
				result.classes.push(currentClass);
				currentClass = null;
			}
			inClassBlock = false;
			continue;
		}

		// If we're in a class block, parse members
		if (inClassBlock && currentClass) {
			const member = parseMember(line);
			if (member) {
				if (member.type === 'method') {
					currentClass.methods.push(member);
				} else {
					currentClass.attributes.push(member);
				}
			}
			continue;
		}

		// Check for relation
		const relationMatch = line.match(/^(\w+)\s*([<>|.*o-]+)\s*"?([^"]*)"?\s*(\w+)\s*:?\s*(.*)$/);
		if (relationMatch) {
			const [, from, arrow, multiplicity, to, label] = relationMatch;
			result.relations.push({
				from,
				to,
				type: parseRelationType(arrow),
				multiplicity: multiplicity.trim() || null,
				label: label.trim() || null
			});
			continue;
		}

		// Alternative relation format
		const simpleRelationMatch = line.match(/^(\w+)\s+([<>|.*o-]+)\s+(\w+)\s*:?\s*(.*)$/);
		if (simpleRelationMatch) {
			const [, from, arrow, to, label] = simpleRelationMatch;
			result.relations.push({
				from,
				to,
				type: parseRelationType(arrow),
				multiplicity: null,
				label: label.trim() || null
			});
			continue;
		}

		// Check for note
		const noteMatch = line.match(/^note\s+for\s+(\w+)\s+"([^"]+)"$/);
		if (noteMatch) {
			result.notes.push({
				forClass: noteMatch[1],
				text: noteMatch[2].replace(/\\n/g, ' ')
			});
			continue;
		}
	}

	// Don't forget the last class if not closed
	if (currentClass) {
		result.classes.push(currentClass);
	}

	return result;
}

/**
 * Generate accessible description from parsed diagram
 */
function generateAccessibleDescription(parsed, locale = 'nl') {
	const t = i18n[locale] || i18n.nl;
	const parts = [];

	// Summary
	const classCount = parsed.classes.length;
	const relationCount = parsed.relations.length;
	parts.push(`${t.classDiagram} ${t.withClasses.replace('{count}', classCount)} ${t.andRelations.replace('{count}', relationCount)}.`);

	// Classes section
	if (parsed.classes.length > 0) {
		parts.push('');
		parts.push(`${t.classes}:`);

		parsed.classes.forEach((cls, index) => {
			const stereotypeName = t[cls.stereotype] || t.class;
			let classDesc = `${index + 1}. ${stereotypeName} ${cls.name}`;

			const members = [];

			// Attributes
			cls.attributes.forEach(attr => {
				const visKey = `${attr.visibility}Attribute`;
				const visName = t[visKey] || attr.visibility + ' attribute';
				members.push(`${visName} ${attr.name} ${t.ofType} ${attr.dataType}`);
			});

			// Methods
			cls.methods.forEach(method => {
				const visKey = `${method.visibility}Method`;
				const visName = t[visKey] || method.visibility + ' method';

				let methodDesc = `${visName} ${method.name}`;

				if (method.parameters.length === 0) {
					methodDesc += `, ${t.noParameters}`;
				} else if (method.parameters.length === 1) {
					const param = method.parameters[0];
					methodDesc += `, ${t.withParameter} ${param.name} ${t.ofType} ${param.type}`;
				} else {
					const paramDescs = method.parameters.map(p => `${p.name} ${t.ofType} ${p.type}`);
					methodDesc += `, ${t.withParameters} ${paramDescs.join(', ')}`;
				}

				methodDesc += `, ${t.returnType} ${method.returnType}`;
				members.push(methodDesc);
			});

			if (members.length > 0) {
				classDesc += ` ${t.with}: ${members.join('; ')}`;
			}

			parts.push(classDesc);
		});
	}

	// Relations section
	if (parsed.relations.length > 0) {
		parts.push('');
		parts.push(`${t.relations}:`);

		parsed.relations.forEach((rel, index) => {
			const relationType = t[rel.type] || rel.type;
			let relDesc = `${index + 1}. ${rel.from} ${relationType} ${rel.to}`;

			if (rel.label) {
				relDesc += `, ${t.withName} ${rel.label}`;
			}
			if (rel.multiplicity) {
				relDesc += `, ${t.multiplicity} ${rel.multiplicity}`;
			}

			parts.push(relDesc);
		});
	}

	// Notes section
	if (parsed.notes.length > 0) {
		parts.push('');
		parts.push(`${t.notes}:`);

		parsed.notes.forEach((note, index) => {
			parts.push(`${index + 1}. ${t.noteFor} ${note.forClass}: "${note.text}"`);
		});
	}

	return parts.join('\n');
}

/**
 * Generate ARIA-friendly HTML structure
 */
function generateAriaHtml(parsed, locale = 'nl') {
	const t = i18n[locale] || i18n.nl;
	const classCount = parsed.classes.length;
	const relationCount = parsed.relations.length;

	const summary = `${t.classDiagram} ${t.withClasses.replace('{count}', classCount)} ${t.andRelations.replace('{count}', relationCount)}`;

	let html = `<div role="img" aria-label="${summary}" class="mermaid-a11y-description">`;
	html += `<div class="visually-hidden" role="document" aria-label="${t.classDiagram}">`;

	// Classes region
	if (parsed.classes.length > 0) {
		html += `<section role="region" aria-label="${t.classes}">`;
		html += `<h4>${t.classes}</h4>`;
		html += '<ul>';

		parsed.classes.forEach(cls => {
			const stereotypeName = t[cls.stereotype] || t.class;
			html += `<li><strong>${stereotypeName} ${cls.name}</strong>`;

			if (cls.attributes.length > 0 || cls.methods.length > 0) {
				html += '<ul>';

				cls.attributes.forEach(attr => {
					const visKey = `${attr.visibility}Attribute`;
					const visName = t[visKey] || attr.visibility;
					html += `<li>${visName} ${attr.name}: ${attr.dataType}</li>`;
				});

				cls.methods.forEach(method => {
					const visKey = `${method.visibility}Method`;
					const visName = t[visKey] || method.visibility;
					const params = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
					html += `<li>${visName} ${method.name}(${params}): ${method.returnType}</li>`;
				});

				html += '</ul>';
			}

			html += '</li>';
		});

		html += '</ul></section>';
	}

	// Relations region
	if (parsed.relations.length > 0) {
		html += `<section role="region" aria-label="${t.relations}">`;
		html += `<h4>${t.relations}</h4>`;
		html += '<ul>';

		parsed.relations.forEach(rel => {
			const relationType = t[rel.type] || rel.type;
			let relDesc = `${rel.from} ${relationType} ${rel.to}`;
			if (rel.label) relDesc += ` (${rel.label})`;
			if (rel.multiplicity) relDesc += ` [${rel.multiplicity}]`;
			html += `<li>${relDesc}</li>`;
		});

		html += '</ul></section>';
	}

	// Notes region
	if (parsed.notes.length > 0) {
		html += `<section role="region" aria-label="${t.notes}">`;
		html += `<h4>${t.notes}</h4>`;
		html += '<ul>';

		parsed.notes.forEach(note => {
			html += `<li>${t.noteFor} ${note.forClass}: ${note.text}</li>`;
		});

		html += '</ul></section>';
	}

	html += '</div></div>';

	return html;
}

module.exports = {
	parseClassDiagram,
	generateAccessibleDescription,
	generateAriaHtml,
	i18n
};
